require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
global.WebSocket = WebSocket;
const { sequelize } = require('./models');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const uploadsDir = path.join(__dirname, 'uploads');

async function uploadFileToSupabase(filePath, folderPath) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const supabasePath = `${folderPath}/${fileName}`;

  // Guess content type from extension (simple approach)
  let contentType = 'application/octet-stream';
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.mp4') contentType = 'video/mp4';
  else if (ext === '.webm') contentType = 'video/webm';

  console.log(`Uploading ${fileName} to Supabase...`);
  
  const { data, error } = await supabase.storage
    .from('ishya-uploads')
    .upload(supabasePath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error(`Failed to upload ${fileName}:`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('ishya-uploads')
    .getPublicUrl(supabasePath);

  return { oldUrl: `/uploads/${fileName}`, newUrl: publicUrlData.publicUrl };
}

async function migrate() {
  console.log('Connecting to database...');
  await sequelize.authenticate();
  console.log('Database connected.');

  const filesToProcess = [];

  // 1. Process root uploads/ directory
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      const fullPath = path.join(uploadsDir, file);
      if (fs.statSync(fullPath).isFile()) {
        const folder = file.startsWith('poster') ? 'posters' : 'media';
        filesToProcess.push({ path: fullPath, folder });
      }
    }
  }

  // 2. Process uploads/scripts/ directory
  const scriptsDir = path.join(uploadsDir, 'scripts');
  if (fs.existsSync(scriptsDir)) {
    const files = fs.readdirSync(scriptsDir);
    for (const file of files) {
      const fullPath = path.join(scriptsDir, file);
      if (fs.statSync(fullPath).isFile()) {
        filesToProcess.push({ path: fullPath, folder: 'scripts' });
      }
    }
  }

  const replacements = [];

  for (const { path: filePath, folder } of filesToProcess) {
    const result = await uploadFileToSupabase(filePath, folder);
    if (result) {
      replacements.push(result);
    }
  }

  console.log(`Finished uploading ${replacements.length} files. Now updating database URLs...`);

  // Update tables
  for (const { oldUrl, newUrl } of replacements) {
    console.log(`Updating DB: Replacing ${oldUrl} with ${newUrl}`);
    
    // Using raw queries to avoid model hooks/validation issues
    await sequelize.query(`UPDATE "Productions" SET "posterUrl" = :newUrl WHERE "posterUrl" LIKE :oldUrlPattern`, {
      replacements: { newUrl, oldUrlPattern: `%${oldUrl}%` }
    });
    await sequelize.query(`UPDATE "Productions" SET "trailerUrl" = :newUrl WHERE "trailerUrl" LIKE :oldUrlPattern`, {
      replacements: { newUrl, oldUrlPattern: `%${oldUrl}%` }
    });
    await sequelize.query(`UPDATE "MediaFiles" SET "fileUrl" = :newUrl WHERE "fileUrl" LIKE :oldUrlPattern`, {
      replacements: { newUrl, oldUrlPattern: `%${oldUrl}%` }
    });
    await sequelize.query(`UPDATE "MediaFiles" SET "thumbnailUrl" = :newUrl WHERE "thumbnailUrl" LIKE :oldUrlPattern`, {
      replacements: { newUrl, oldUrlPattern: `%${oldUrl}%` }
    });
    await sequelize.query(`UPDATE "Users" SET "profilePicture" = :newUrl WHERE "profilePicture" LIKE :oldUrlPattern`, {
      replacements: { newUrl, oldUrlPattern: `%${oldUrl}%` }
    });
    await sequelize.query(`UPDATE "Talents" SET "photoUrl" = :newUrl WHERE "photoUrl" LIKE :oldUrlPattern`, { // Guessing photoUrl if it exists
      replacements: { newUrl, oldUrlPattern: `%${oldUrl}%` }
    }).catch(() => {}); // Ignore if column doesn't exist
    await sequelize.query(`UPDATE "Scripts" SET "fileUrl" = :newUrl WHERE "fileUrl" LIKE :oldUrlPattern`, {
      replacements: { newUrl, oldUrlPattern: `%${oldUrl}%` }
    });
  }

  console.log('Migration completed completely!');
  process.exit(0);
}

migrate();
