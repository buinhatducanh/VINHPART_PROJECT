const fs = require('fs');
const content = fs.readFileSync('out2.txt', 'utf16le');
fs.writeFileSync('out2_utf8.txt', content, 'utf8');
