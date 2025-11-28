const fs = require('fs');
const jwt = require('jsonwebtoken');

try {
    const content = fs.readFileSync('../login_response.json', 'utf8');
    const loginResponse = JSON.parse(content);
    const token = loginResponse.token;
    const decoded = jwt.decode(token);

    console.log('Decoded Token:', JSON.stringify(decoded, null, 2));
    console.log('User ID from Login Response:', loginResponse.user.id);
} catch (error) {
    console.error('Error decoding token:', error);
}
