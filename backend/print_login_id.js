const fs = require('fs');
try {
    const content = fs.readFileSync('../login_response.json', 'utf8');
    const json = JSON.parse(content);
    console.log('Login User ID:', json.user.id);
} catch (e) {
    console.error(e);
}
