const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Directories
const srcDir = `../webpunk/art/unprocessed`; // Your source folder with images
const destDir = `../webpunk/art/processed`; // Folder to save the optimized images

// Ensure destination folder exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

// Function to compress a single image
async function compressImage(filePath, destPath) {
  if (fs.existsSync(destPath)) return;

  try {
    await sharp(filePath, {
      animated: true,
    })
      .resize({
        height: 500,
      })
      .webp({ quality: 50 })
      .toFile(destPath);
    console.log(`Compressed to WebP: ${destPath}`);
  } catch (error) {
    console.error(`Error compressing ${filePath}:`, error);
  }
}

// Function to process a folder (including subfolders)
async function processFolder(folderPath) {
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const stat = fs.lstatSync(fullPath);

    // Skip excluded subfolders
    if (stat.isDirectory() && fullPath.includes("songThumbnails")) {
      console.log(`Skipping folder: ${fullPath}`);
      continue;
    }

    if (stat.isDirectory()) {
      // If it's a directory, process it recursively
      const relativePath = path.relative(srcDir, fullPath);
      const destFolder = path.join(destDir, relativePath);
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }
      await processFolder(fullPath); // Recursive call
    } else {
      // Process image files
      const ext = path.extname(file).toLowerCase();
      const relativePath = path.relative(srcDir, fullPath);
      const destFolder = path.join(destDir, path.dirname(relativePath));

      // Create subfolder in destination if it doesn't exist
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }

      // Define destination paths for WebP
      const destPathWebP = path.join(
        destFolder,
        path.basename(file, ext) + ".webp"
      );

      await compressImage(fullPath, destPathWebP);
    }
  }
}

// Start processing from the source directory
processFolder(srcDir)
  .then(() => console.log("Image compression completed!"))
  .catch((error) => console.error("Error in processing:", error));
