import { sequelize } from '../config/database';
import User from '../models/User.model';
import fs from 'fs';

async function listUsers() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll();
        let output = '';
        users.forEach(u => {
            output += `${u.id}\n`;
        });
        fs.writeFileSync('ids.txt', output);
        console.log('Wrote IDs to ids.txt');
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        await sequelize.close();
    }
}

listUsers();
