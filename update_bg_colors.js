const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /bg-white\/85/g, to: 'bg-white/5' },
  { from: /bg-white\/75/g, to: 'bg-white/5' },
  { from: /bg-white\/90/g, to: 'bg-white/5' },
  { from: /bg-white\b(?!(\/5|\/10|\/20|\/30))/g, to: 'bg-black/40' },
  { from: /border-slate-700\/50/g, to: 'border-white/10' },
  { from: /border-slate-700\/70/g, to: 'border-white/10' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const r of replacements) {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
