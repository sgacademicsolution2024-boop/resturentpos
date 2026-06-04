const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /amber-500/g, to: 'blue-500' },
  { from: /amber-600/g, to: 'blue-600' },
  { from: /amber-700/g, to: 'blue-700' },
  { from: /amber-400/g, to: 'blue-400' },
  { from: /amber-900/g, to: 'blue-900' },
  { from: /orange-500/g, to: 'blue-500' },
  { from: /orange-600/g, to: 'blue-600' },
  { from: /orange-700/g, to: 'blue-700' },
  { from: /orange-400/g, to: 'blue-400' },
  { from: /orange-300/g, to: 'blue-300' },
  { from: /orange-200/g, to: 'slate-700' },
  { from: /orange-100/g, to: 'slate-800' },
  { from: /orange-50/g, to: 'slate-900' },
  { from: /yellow-100/g, to: 'slate-800' },
  { from: /yellow-200/g, to: 'blue-300' },
  { from: /yellow-300/g, to: 'blue-400' },
  { from: /text-\[\#2a1309\]/g, to: 'text-white' },
  { from: /bg-\[\#2a1309\]/g, to: 'bg-slate-950' },
  { from: /text-\[\#7a3f1d\]/g, to: 'text-slate-300' },
  { from: /text-\[\#5c2d17\]/g, to: 'text-slate-400' },
  { from: /border-\[\#2a1309\]/g, to: 'border-slate-800' },
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
