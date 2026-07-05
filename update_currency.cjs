const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/shared/FoodCard.tsx',
  'src/pages/FoodDetailPage.tsx',
  'src/pages/CustomerMenuPage.tsx',
  'src/pages/AdminAddFoodPage.tsx',
  'src/pages/AdminPreviewPage.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace literal text
  content = content.replace(/\(\$\)/g, '(LKR)');
  
  // Replace JSX variables where they use $ directly like ${item.finalPrice
  content = content.replace(/\$\{item\.originalPrice\.toFixed\(2\)\}/g, 'LKR {item.originalPrice.toFixed(2)}');
  content = content.replace(/\$\{item\.finalPrice\.toFixed\(2\)\}/g, 'LKR {item.finalPrice.toFixed(2)}');
  
  // Replace JSX strings where they use \${item.finalPrice (Wait, in JSX text \${item...} is just literal text \$ followed by {item...} but actually they might be written as \${item.finalPrice.toFixed(2)} or \$\{item.finalPrice.toFixed(2)\} or literally just $\\{item.finalPrice.toFixed(2)\\}... wait)
  
  // In CustomerMenuPage, they wrote \${item.finalPrice.toFixed(2)} as text in JSX:
  // e.g. <span className="text-sm font-bold">\${item.finalPrice.toFixed(2)}</span>
  content = content.replace(/\\\$\{item\.finalPrice\.toFixed\(2\)\}/g, 'LKR {item.finalPrice.toFixed(2)}');
  content = content.replace(/\\\$\{item\.originalPrice\.toFixed\(2\)\}/g, 'LKR {item.originalPrice.toFixed(2)}');
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
