const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/CustomerMenuPage.tsx',
  'src/pages/AdminAddFoodPage.tsx',
  'src/pages/AdminPreviewPage.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix stray \LKR
  content = content.replace(/\\LKR /g, 'LKR ');
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed ' + file);
});
