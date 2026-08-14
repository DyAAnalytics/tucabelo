const fs = require('fs');
const path = require('path');

const dir = './';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const replacements = {
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',  // i con tilde (sometimes it's two bytes)
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Ã ': 'Á',
  'Ã‰': 'É',
  'Ã\x8D': 'Í',
  'Ã“': 'Ó',
  'Ãš': 'Ú',
  'Ã‘': 'Ñ',
  'BarberÃa': 'Barbería', // Hardcode common ones just in case the trailing byte was lost
  'categorÃas': 'categorías',
  'CategorÃas': 'Categorías',
  'peluquerÃa': 'peluquería',
  'dÃa': 'día',
  'CatÃ¡logo': 'Catálogo',
  'MÃ¡s': 'Más'
};

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Replace all occurrences
  for (const [bad, good] of Object.entries(replacements)) {
    content = content.split(bad).join(good);
  }
  
  fs.writeFileSync(path.join(dir, file), content, 'utf8');
  console.log(`Fixed encoding in ${file}`);
});
