"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Charity_model_1 = require("../models/Charity.model");
const testCharities = [
    {
        charityNumber: 'CC12345',
        name: 'Salvation Army',
        description: 'The Salvation Army is a Christian church and international charitable organisation.',
        category: 'Social Services',
        email: 'contact@salvationarmy.org.nz',
        website: 'https://www.salvationarmy.org.nz',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEQzI2MjYiLz48dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjwvdGV4dD48L3N2Zz4=',
        bankAccount: '12-3456-7890123-00',
        irdNumber: '123456789',
        taxDeductible: true,
        gstRegistered: true,
        isActive: true
    },
    {
        charityNumber: 'CC23456',
        name: 'Red Cross',
        description: 'New Zealand Red Cross provides emergency response and community services.',
        category: 'Emergency Services',
        email: 'info@redcross.org.nz',
        website: 'https://www.redcross.org.nz',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEQzI2MjYiLz48dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPis8L3RleHQ+PC9zdmc+',
        bankAccount: '12-3456-7890124-00',
        irdNumber: '123456790',
        taxDeductible: true,
        gstRegistered: true,
        isActive: true
    },
    {
        charityNumber: 'CC34567',
        name: 'Forest & Bird',
        description: 'Protecting native wildlife and wild places in New Zealand.',
        category: 'Environment',
        email: 'info@forestandbird.org.nz',
        website: 'https://www.forestandbird.org.nz',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMyMjhCMjIiLz48dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkY8L3RleHQ+PC9zdmc+',
        bankAccount: '12-3456-7890125-00',
        irdNumber: '123456791',
        taxDeductible: true,
        gstRegistered: true,
        isActive: true
    }
];
async function seedCharities() {
    try {
        await database_1.sequelize.authenticate();
        console.log('Database connected successfully');
        await database_1.sequelize.sync();
        console.log('Database synced');
        // Clear existing charities
        await Charity_model_1.Charity.destroy({ where: {} });
        console.log('Cleared existing charities');
        // Create test charities
        for (const charityData of testCharities) {
            await Charity_model_1.Charity.create(charityData);
            console.log(`Created charity: ${charityData.name}`);
        }
        console.log('✅ Charity seeding completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding charities:', error);
        process.exit(1);
    }
}
seedCharities();
//# sourceMappingURL=seed-charities.js.map