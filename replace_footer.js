const fs = require('fs');
const path = require('path');

const dir = 'c:/xampp/htdocs/tucabelo';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'admin.html');

const newContactoHtml = `
      <div class="footer-col">
        <h4>Contacto</h4>
        <ul>
          <li><a href="https://wa.me/56986018173" target="_blank">WhatsApp</a></li>
          <li><a href="https://www.instagram.com/tuca_belo/" target="_blank">Instagram</a></li>
          <li><a href="https://www.facebook.com/tucabeloangol/" target="_blank">Facebook</a></li>
        </ul>
      </div>`;

// Regex to find the Contacto column
const contactRegexIndex = /<div class="footer-col">\s*<h4>Contacto<\/h4>\s*<ul>[\s\S]*?<\/ul>\s*<\/div>/g;
const contactRegexInline = /<div class="footer-col"><h4>Contacto<\/h4><ul>.*?<\/ul><\/div>/g;
const inlineReplacement = `<div class="footer-col"><h4>Contacto</h4><ul><li><a href="https://wa.me/56986018173" target="_blank">WhatsApp</a></li><li><a href="https://www.instagram.com/tuca_belo/" target="_blank">Instagram</a></li><li><a href="https://www.facebook.com/tucabeloangol/" target="_blank">Facebook</a></li></ul></div>`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update Contacto column
    if (file === 'index.html') {
        content = content.replace(contactRegexIndex, newContactoHtml);
    } else {
        content = content.replace(contactRegexInline, inlineReplacement);
    }

    // Also update the social links in footer-brand to match new urls
    content = content.replace(/href="https:\/\/instagram\.com\/tucabelo"/g, 'href="https://www.instagram.com/tuca_belo/"');
    content = content.replace(/href="https:\/\/facebook\.com\/tucabelo"/g, 'href="https://www.facebook.com/tucabeloangol/"');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
