const fs = require('fs');
const content = fs.readFileSync('users.txt', 'utf8');
const lines = content.split('\n');
lines.forEach(line => {
    if (line.includes('ID:')) {
        console.log(line.trim());
    }
});
