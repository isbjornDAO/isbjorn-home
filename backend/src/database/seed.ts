import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import User from '../models/User.model';
import Charity from '../models/Charity.model';
import Project from '../models/Project.model';
import { logger } from '../utils/logger';
import { sequelize } from '../config/database';

class DatabaseSeeder {
  
  async seedUsers(): Promise<void> {
    try {
      const existingUsers = await User.count();
      if (existingUsers > 0) {
        logger.info('Users already exist, skipping user seeding');
        return;
      }

      // Create admin user
      await User.create({
        id: uuidv4(),
        email: 'admin@isbjorn.co.nz',
        password: 'admin123',
        role: 'admin',
        emailVerified: true,
        companyName: 'Isbjorn Foundation',
        taxId: 'NZ1234567890',
        description: 'System Administrator Account'
      });

      // Create test business user
      await User.create({
        id: uuidv4(),
        email: 'business@example.co.nz',
        password: 'business123',
        role: 'user',
        emailVerified: true,
        companyName: 'Example Business Ltd',
        taxId: 'NZ9876543210',
        description: 'Test Business Account'
      });

      logger.info('✅ Users seeded successfully');
    } catch (error) {
      logger.error('❌ Failed to seed users:', error);
      throw error;
    }
  }

  async seedCharities(): Promise<void> {
    try {
      const existingCharities = await Charity.count();
      if (existingCharities > 0) {
        logger.info('Charities already exist, skipping charity seeding');
        return;
      }

      const charities = [
        {
          id: uuidv4(),
          name: 'Isbjorn Arctic Conservation',
          charityNumber: 'CC12345',
          description: 'Leading the fight to protect Arctic ice and polar bear habitats through scientific research and direct conservation action.',
          category: 'Environment',
          location: 'Auckland, NZ',
          website: 'https://isbjorn.co.nz',
          email: 'contact@isbjorn.co.nz',
          phone: '+64 9 123 4567',
          logoUrl: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5).png',
          charityPhoto: 'https://images.unsplash.com/photo-1551446591-142875a901a1?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          icon: '🐻‍❄️',
          bankAccount: '12-3456-0123456-00',
          irdNumber: 'IRD123456789',
          totalReceived: 0,
          donationCount: 0,
          isActive: true
        },
        {
          id: uuidv4(),
          name: 'The Salvation Army New Zealand',
          charityNumber: 'CC123456',
          description: 'Fighting poverty and social distress since 1883. Providing budgeting advice, food assistance, and support to 120,000+ families annually.',
          category: 'Social Services',
          location: 'National, NZ',
          website: 'https://salvationarmy.org.nz',
          email: 'info@salvationarmy.org.nz',
          phone: '+64 9 262 2332',
          logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjREMyNjI2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+U2FsdmF0aW9uPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkFybXk8L3RleHQ+Cjwvc3ZnPgo=',
          charityPhoto: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          icon: '🛡️',
          bankAccount: '12-3456-0123457-00',
          irdNumber: 'IRD987654321',
          totalReceived: 0,
          donationCount: 0,
          isActive: true
        },
        {
          id: uuidv4(),
          name: 'Starship Foundation',
          charityNumber: 'CC234567',
          description: 'Supporting NZ\'s national children\'s hospital. $160M+ raised since 1992 for world-class pediatric healthcare and research.',
          category: 'Health',
          location: 'Auckland, NZ',
          website: 'https://starship.org.nz',
          email: 'info@starship.org.nz',
          phone: '+64 9 307 4949',
          logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA3N0JFIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTAwLDQwIDEyMCw4MCA4MCw4MCIgZmlsbD0iI0ZGRDcwMCIvPgo8dGV4dCB4PSIxMDAiIHk9IjEyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPlN0YXJzaGlwPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkZvdW5kYXRpb248L3RleHQ+Cjwvc3ZnPgo=',
          charityPhoto: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          icon: '⭐',
          bankAccount: '12-3456-0123458-00',
          irdNumber: 'IRD456789123',
          totalReceived: 0,
          donationCount: 0,
          isActive: true
        },
        {
          id: uuidv4(),
          name: 'Forest & Bird',
          charityNumber: 'CC345678',
          description: 'NZ\'s leading independent conservation organisation since 1923. Protecting indigenous flora, fauna and natural ecosystems.',
          category: 'Environment',
          location: 'National, NZ',
          website: 'https://forestandbird.org.nz',
          email: 'office@forestandbird.org.nz',
          phone: '+64 4 385 7374',
          logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMkU3RDMyIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSIxNSIgZmlsbD0iIzQ2QTA0RSIvPgo8cGF0aCBkPSJNODUgODVMOTUgOTVMOTAgMTAwTDEwMCAxMTBMMTEwIDEwMEwxMDUgOTVMMTE1IDg1Wk04NSA4NUw5MCA5MEw4NSA5NVoiIGZpbGw9IiM0NkEwNEUiLz4KPHR1ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+Rm9yZXN0ICZhbXA7PC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkJpcmQ8L3RleHQ+Cjwvc3ZnPgo=',
          charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          icon: '🦜',
          bankAccount: '12-3456-0123459-00',
          irdNumber: 'IRD789123456',
          totalReceived: 0,
          donationCount: 0,
          isActive: true
        },
        {
          id: uuidv4(),
          name: 'KidsCan',
          charityNumber: 'CC456789',
          description: 'NZ\'s leading children\'s charity. Providing food, clothing and health items to 60,000+ Kiwi kids daily since 2005.',
          category: 'Education',
          location: 'Auckland, NZ',
          website: 'https://kidscan.org.nz',
          email: 'info@kidscan.org.nz',
          phone: '+64 9 448 1043',
          logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2QjM1Ii8+CjxjaXJjbGUgY3g9IjkwIiBjeT0iNzAiIHI9IjEwIiBmaWxsPSIjRkZEOTAwIi8+CjxjaXJjbGUgY3g9IjExMCIgY3k9IjcwIiByPSIxMCIgZmlsbD0iI0ZGRDkwMCIvPgo8cGF0aCBkPSJNODAgODVIODVWOTBIODBaIiBmaWxsPSIjRkZEOTAwIi8+CjxwYXRoIGQ9Ik0xMTUgODVIMTIwVjkwSDExNVoiIGZpbGw9IiNGRkQ5MDAiLz4KPHR1ZXh0IHg9IjEwMCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+S2lkc0NhbjwvdGV4dD4KPC9zdmc+Cg==',
          charityPhoto: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          icon: '👶',
          bankAccount: '12-3456-0123460-00',
          irdNumber: 'IRD321654987',
          totalReceived: 0,
          donationCount: 0,
          isActive: true
        },
        {
          id: uuidv4(),
          name: 'Red Cross New Zealand',
          charityNumber: 'CC567890',
          description: 'Part of the world\'s largest humanitarian network. Disaster relief, refugee support, first aid training, and community services.',
          category: 'Emergency Relief',
          location: 'National, NZ',
          website: 'https://redcross.org.nz',
          email: 'info@redcross.org.nz',
          phone: '+64 4 472 3750',
          logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNOTAgNjBIMTEwVjgwSDEyMFYxMDBIMTEwVjEyMEg5MFYxMDBIODBWODBIOTBWNjBaIiBmaWxsPSIjREMyNjI2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjREMyNjI2IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5SZWQgQ3Jvc3M8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjREMyNjI2IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5OZXcgWmVhbGFuZDwvdGV4dD4KPC9zdmc+Cg==',
          charityPhoto: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          icon: '➕',
          bankAccount: '12-3456-0123461-00',
          irdNumber: 'IRD654987321',
          totalReceived: 0,
          donationCount: 0,
          isActive: true
        }
      ];

      await Charity.bulkCreate(charities);
      logger.info('✅ Charities seeded successfully');
    } catch (error) {
      logger.error('❌ Failed to seed charities:', error);
      throw error;
    }
  }

  async seedProjects(): Promise<void> {
    try {
      const existingProjects = await Project.count();
      if (existingProjects > 0) {
        logger.info('Projects already exist, skipping project seeding');
        return;
      }

      // Get seeded charities
      const charities = await Charity.findAll();
      
      if (charities.length === 0) {
        logger.warn('No charities found for project seeding');
        return;
      }

      const projects = [
        {
          id: uuidv4(),
          title: 'Arctic Ice Protection Initiative',
          description: 'Direct funding for scientific research and conservation efforts to protect melting Arctic ice sheets and polar bear habitats.',
          charityId: charities.find(c => c.name === 'Isbjorn Arctic Conservation')?.id,
          targetAmount: 500000,
          raisedAmount: 125000,
          currency: 'NZD',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
          category: 'Environment'
        },
        {
          id: uuidv4(),
          title: 'Emergency Housing Support',
          description: 'Providing temporary accommodation and support services for families in crisis across New Zealand.',
          charityId: charities.find(c => c.name === 'The Salvation Army New Zealand')?.id,
          targetAmount: 1000000,
          raisedAmount: 425000,
          currency: 'NZD',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
          category: 'Social Services'
        }
      ];

      await Project.bulkCreate(projects.filter(p => p.charityId));
      logger.info('✅ Projects seeded successfully');
    } catch (error) {
      logger.error('❌ Failed to seed projects:', error);
      throw error;
    }
  }

  async seedAll(): Promise<void> {
    try {
      logger.info('🌱 Starting database seeding...');
      
      await this.seedUsers();
      await this.seedCharities();
      await this.seedProjects();
      
      logger.info('🎉 Database seeding completed successfully!');
    } catch (error) {
      logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}

// Run seeding if called directly
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      logger.info('Database connection established successfully');
      return sequelize.sync();
    })
    .then(() => {
      logger.info('Database synchronized successfully');
      const seeder = new DatabaseSeeder();
      return seeder.seedAll();
    })
    .then(() => {
      logger.info('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default DatabaseSeeder;