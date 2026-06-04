const fs = require('fs');
let text = fs.readFileSync('./supabase/rls.sql', 'utf8');
text = text.replace(/'owner'/g, "'admin'");
text = text.replace(/_owner/g, "_admin");
fs.writeFileSync('./supabase/rls.sql', text);
console.log("Done");
