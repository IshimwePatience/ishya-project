require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
global.WebSocket = WebSocket;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const uploadsDir = path.join(__dirname, 'uploads');
const sqlFile = fs.createWriteStream('update_urls.sql');

async function uploadFileToSupabase(filePath, folderPath) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const supabasePath = `${folderPath}/${fileName}`;

  let contentType = 'application/octet-stream';
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.jfif') contentType = 'image/jpeg';
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
    console.log(`Failed: ${error.message}`);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('ishya-uploads')
    .getPublicUrl(supabasePath);

  const oldUrl = `/uploads/${fileName}`;
  const newUrl = publicUrlData.publicUrl;

  sqlFile.write(`UPDATE "Productions" SET "posterUrl" = '${newUrl}' WHERE "posterUrl" LIKE '%${oldUrl}%';\n`);
  sqlFile.write(`UPDATE "Productions" SET "trailerUrl" = '${newUrl}' WHERE "trailerUrl" LIKE '%${oldUrl}%';\n`);
  sqlFile.write(`UPDATE "MediaFiles" SET "fileUrl" = '${newUrl}' WHERE "fileUrl" LIKE '%${oldUrl}%';\n`);
  sqlFile.write(`UPDATE "Users" SET "profilePicture" = '${newUrl}' WHERE "profilePicture" LIKE '%${oldUrl}%';\n`);
  sqlFile.write(`UPDATE "Scripts" SET "fileUrl" = '${newUrl}' WHERE "fileUrl" LIKE '%${oldUrl}%';\n`);
}

async function run() {
  const filesToProcess = [];
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

  for (const { path, folder } of filesToProcess) {
    await uploadFileToSupabase(path, folder);
  }
  
  sqlFile.end();
  console.log("Done uploading.");
}

run();
