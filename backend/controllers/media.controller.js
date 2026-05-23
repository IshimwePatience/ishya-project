const { MediaFile, Production, Contract, Buyer } = require('../models');
const { Op } = require('sequelize');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

exports.getPartnerCatalog = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await req.user.constructor.findByPk(userId);
    
    if (user && !user.buyerId) {
      const matchingBuyer = await Buyer.findOne({ where: { email: user.email } });
      if (matchingBuyer) {
        user.buyerId = matchingBuyer.id;
        await user.save();
      }
    }
    
    const buyerId = user?.buyerId;

    const productions = await Production.findAll({
      include: [
        {
          model: MediaFile,
          as: 'mediaFiles',
          required: false
        },
        {
          model: Contract,
          where: { buyerId: buyerId || 0 }, // Filter by this partner's contracts if they have a buyerId
          required: false, // Include all productions, even those without a contract
          attributes: ['id', 'status', 'expiryDate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Map productions to include a simple 'isLicensed' boolean for the frontend
    const results = productions.map(p => {
      const activeContract = p.Contracts?.find(c => c.status === 'Active' && new Date(c.expiryDate) > new Date());
      const prodJson = p.toJSON();
      delete prodJson.Contracts; // Remove raw contracts for cleaner API
      return {
        ...prodJson,
        isLicensed: !!activeContract
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPartnerLibrary = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await req.user.constructor.findByPk(userId); // Get fresh user with buyerId

    if (!user.buyerId) {
      // Self-healing: Try to link user to buyer by email if not already linked
      const matchingBuyer = await Buyer.findOne({ where: { email: user.email } });
      if (matchingBuyer) {
        user.buyerId = matchingBuyer.id;
        await user.save();
      } else {
        // If still no buyerId, return empty list instead of 403 for better UX
        return res.json([]);
      }
    }

    // Find all active contracts for this buyer
    const contracts = await Contract.findAll({
      where: {
        buyerId: user.buyerId,
        status: 'Active',
        expiryDate: { [Op.gt]: new Date() } // Not expired
      },
      include: [
        {
          model: Production,
          include: [{ model: MediaFile, as: 'mediaFiles' }] // Full access to all media files for these productions
        }
      ]
    });

    // Extract productions from contracts
    const productions = contracts.map(c => c.Production);
    res.json(productions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMedia = async (req, res) => {
  try {
    const media = await MediaFile.findAll({
      include: [{ model: Production, as: 'production' }]
    });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMediaById = async (req, res) => {
  try {
    const media = await MediaFile.findByPk(req.params.id, {
      include: [{ model: Production, as: 'production' }]
    });
    if (!media) return res.status(404).json({ message: 'Media not found' });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const media = await MediaFile.bulkCreate(req.body);
      return res.status(201).json(media);
    }
    const media = await MediaFile.create(req.body);
    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const media = await MediaFile.findByPk(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media asset not found' });
    
    await media.update(req.body);

    // If description is updated, sync it across all assets AND the Production itself
    if (req.body.description && media.productionId) {
      // Update all associated media assets
      await MediaFile.update(
        { description: req.body.description },
        { where: { productionId: media.productionId } }
      );
      // Update the parent Production record
      await Production.update(
        { description: req.body.description },
        { where: { id: media.productionId } }
      );
    }

    res.json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await MediaFile.findByPk(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media asset not found' });
    await media.destroy();
    res.json({ message: 'Media asset deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadMediaFile = async (req, res) => {
  try {
    const { id } = req.params;
    const format = req.query.format ? req.query.format.toLowerCase() : null;

    const mediaFile = await MediaFile.findByPk(id);
    if (!mediaFile) {
      return res.status(404).json({ message: 'Media file not found' });
    }

    // Build the full path
    let cleanPath = mediaFile.filePath;
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      try {
        const urlObj = new URL(cleanPath);
        cleanPath = urlObj.pathname;
      } catch (e) {
        const index = cleanPath.indexOf('/uploads/');
        if (index !== -1) {
          cleanPath = cleanPath.substring(index);
        }
      }
    }
    cleanPath = cleanPath.replace(/^\//, ''); // remove leading slash if any
    const fullPath = path.resolve(__dirname, '..', cleanPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Physical file not found on server' });
    }

    const currentExt = path.extname(fullPath).toLowerCase(); // e.g., '.webm' or '.png'
    const targetExt = format ? `.${format}` : currentExt;

    let baseName = mediaFile.fileName || 'asset';
    // Clean baseName from any existing extension
    const existingExt = path.extname(baseName);
    if (existingExt) {
      baseName = path.basename(baseName, existingExt);
    }

    const finalFilename = `${baseName}${targetExt}`;

    // If no format requested, or format is the same as the current file
    if (!format || currentExt === targetExt || (targetExt === '.jpg' && currentExt === '.jpeg') || (targetExt === '.jpeg' && currentExt === '.jpg')) {
      return res.download(fullPath, finalFilename);
    }

    // We need to transcode/convert the file!
    console.log(`🎬 Transcoding: ${currentExt} -> ${targetExt} for file ${fullPath}`);
    
    // Create a temp file path in our workspace backend temp folder
    const tempDir = path.resolve(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPath = path.join(tempDir, `download-${Date.now()}${targetExt}`);

    // Formulate ffmpeg command
    let ffmpegCmd = '';
    
    if (['.mp4', '.webm'].includes(targetExt)) {
      // Video transcoding: use standard highly compatible libx264 / aac codecs for mp4
      if (targetExt === '.mp4') {
        ffmpegCmd = `ffmpeg -i "${fullPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -y "${tempPath}"`;
      } else if (targetExt === '.webm') {
        ffmpegCmd = `ffmpeg -i "${fullPath}" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus -y "${tempPath}"`;
      }
    } else if (['.png', '.jpg', '.jpeg'].includes(targetExt)) {
      // Image conversion
      ffmpegCmd = `ffmpeg -i "${fullPath}" -y "${tempPath}"`;
    }

    if (!ffmpegCmd) {
      // Unsupported conversion, fall back to direct file download
      return res.download(fullPath, finalFilename);
    }

    exec(ffmpegCmd, (error, stdout, stderr) => {
      if (error) {
        console.error('ffmpeg conversion error:', error);
        console.error('ffmpeg stderr:', stderr);
        // Fall back to direct file download if transcoding fails
        return res.download(fullPath, finalFilename);
      }

      // Transcoding succeeded! Send the converted file as a forced attachment download.
      res.download(tempPath, finalFilename, (downloadError) => {
        // Clean up the temp file after download ends (success or fail)
        fs.unlink(tempPath, (unlinkError) => {
          if (unlinkError) console.error('Failed to delete temp file:', unlinkError);
        });
      });
    });

  } catch (error) {
    console.error('Error in downloadMediaFile:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.downloadZip = async (req, res) => {
  try {
    const { ids, name } = req.query;
    if (!ids) {
      return res.status(400).json({ message: 'No file IDs provided' });
    }

    const idList = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (idList.length === 0) {
      return res.status(400).json({ message: 'Invalid file IDs' });
    }

    const mediaFiles = await MediaFile.findAll({
      where: {
        id: { [Op.in]: idList }
      }
    });

    if (mediaFiles.length === 0) {
      return res.status(404).json({ message: 'No media files found matching the provided IDs' });
    }

    const zipName = (name || 'assets').replace(/[^a-z0-9_-]/gi, '_') + '.zip';

    // Set headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Pipe archive data to the response
    archive.pipe(res);

    for (const mediaFile of mediaFiles) {
      let cleanPath = mediaFile.filePath;
      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        try {
          const urlObj = new URL(cleanPath);
          cleanPath = urlObj.pathname;
        } catch (e) {
          const index = cleanPath.indexOf('/uploads/');
          if (index !== -1) {
            cleanPath = cleanPath.substring(index);
          }
        }
      }
      cleanPath = cleanPath.replace(/^\//, '');
      const fullPath = path.resolve(__dirname, '..', cleanPath);

      if (fs.existsSync(fullPath)) {
        const ext = path.extname(fullPath);
        let baseName = mediaFile.fileName || 'asset';
        if (baseName.endsWith(ext)) {
          baseName = path.basename(baseName, ext);
        }
        const fileInZipName = `${baseName}${ext}`;
        archive.file(fullPath, { name: fileInZipName });
      }
    }

    await archive.finalize();

  } catch (error) {
    console.error('Error creating ZIP download:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};
