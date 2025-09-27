const fs = require('fs');

try {
  // Read the file
  const fileContent = fs.readFileSync('C:/Users/laljee/WebstormProjects/doxireact/fronted/src/pages/admin/NotificationsSettings.jsx', 'utf8');
  
  // Try to parse as JavaScript (this will catch syntax errors)
  // We'll wrap it in a function to make it valid JS for parsing
  const wrappedContent = `
    (function() {
      ${fileContent.replace(/export default .*;/, '')}
      return true;
    })();
  `;
  
  // Try to evaluate the wrapped content
  eval(wrappedContent);
  console.log('File parsed successfully - no syntax errors detected');
} catch (error) {
  console.error('Syntax error detected:', error.message);
  console.error('Error location:', error.stack);
}