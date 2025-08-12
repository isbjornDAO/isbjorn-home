import { Sequelize } from 'sequelize-typescript';
import path from 'path';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(process.cwd(), 'database.sqlite'),
  logging: false,
  models: [
    path.join(__dirname, '../models/User.model.ts'),
    path.join(__dirname, '../models/Charity.model.ts'),
    path.join(__dirname, '../models/NZCompany.model.ts'),
    path.join(__dirname, '../models/Project.model.ts'),
    path.join(__dirname, '../models/Donation.model.ts'),
    path.join(__dirname, '../models/IRDCompliantDonation.model.ts'),
    path.join(__dirname, '../models/Receipt.model.ts'),
    path.join(__dirname, '../models/BlockchainTransaction.model.ts'),
  ],
});