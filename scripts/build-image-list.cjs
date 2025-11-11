const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../public/img');
const outputFile = path.join(__dirname, '../public/image-list.json');

// Function to recursively get all file paths
function getAllFiles(dir, baseDir = '') {
    const files = fs.readdirSync(dir);
    let fileList = [];

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const relativePath = path.join(baseDir, file);

        if (fs.statSync(filePath).isDirectory()) {
            fileList = fileList.concat(getAllFiles(filePath, relativePath));
        } else {
            fileList.push(relativePath.replace(/\\/g, '/'));
        }
    });

    return fileList;
}

// Get all files in the img directory
const fileList = getAllFiles(imgDir);

// Write the file list to a JSON file
fs.writeFileSync(outputFile, JSON.stringify(fileList, null, 2), 'utf-8');

console.log(`Image list saved to ${outputFile}`);
