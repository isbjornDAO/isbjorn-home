import express from 'express';
import { Charity } from '../models/Charity.model';

const router = express.Router();

router.get('/charities', async (req, res) => {
  try {
    // Always return static data with images for now until database is properly populated
    // const charities = await Charity.findAll({
    //   where: { isActive: true },
    //   attributes: ['id', 'name', 'description', 'category', 'website', 'logoUrl', 'charityPhoto', 'icon', 'location', 'totalReceived', 'donationCount']
    // });
    
    // if (charities.length > 0 && charities[0].charityPhoto) {
    //   res.json({ success: true, data: charities });
    //   return;
    // }
    
    // Fallback to static data with images and emojis
    const staticCharities = [
      {
        id: '1',
        name: 'Isbjorn Arctic Conservation',
        description: 'Leading the fight to protect Arctic ice and polar bear habitats through scientific research and direct conservation action.',
        fullDescription: 'Since 2019, Isbjorn has been at the forefront of Arctic conservation efforts. Our mission is to protect polar bear habitats and Arctic ice through cutting-edge scientific research, community engagement, and direct conservation action.\n\nWe work with indigenous communities, researchers, and governments to implement sustainable solutions that protect the Arctic ecosystem while supporting local livelihoods.\n\nOur research stations across the Arctic provide critical data on ice thickness, polar bear populations, and climate change impacts, informing global conservation strategies.',
        category: 'Environment',
        location: 'Auckland, NZ',
        website: 'https://isbjorn.co.nz',
        logoUrl: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5).png',
        charityPhoto: 'https://images.unsplash.com/photo-1551446591-142875a901a1?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '🐻‍❄️',
        totalReceived: 125000,
        donationCount: 847,
        verified: true,
        impact: {
          bearsHelped: '142',
          iceProtected: '5,200 km²',
          researchProjects: '18'
        },
        milestones: [
          { title: 'Fund 100 polar bear tracking collars', progress: 72, target: 150000, raised: 108000 },
          { title: 'Establish new Arctic research station', progress: 41, target: 300000, raised: 123000 },
          { title: 'Community conservation grants program', progress: 19, target: 80000, raised: 15200 }
        ]
      },
      {
        id: '2',
        name: 'The Salvation Army New Zealand',
        description: 'Fighting poverty and social distress since 1883. Providing budgeting advice, food assistance, and support to 120,000+ families annually.',
        fullDescription: 'The Salvation Army has been serving New Zealand communities for over 140 years, providing practical support and spiritual care to those most in need.\n\nOur services include emergency housing, family violence support, addiction recovery programs, youth services, and community support. We operate food banks, budget advice services, and employment programs nationwide.\n\nEvery day, we work alongside individuals and families to break cycles of poverty and hardship, offering hope and practical solutions for a better future.',
        category: 'Social Services',
        location: 'National, NZ',
        website: 'https://salvationarmy.org.nz',
        logoUrl: 'https://www.salvationarmy.org.nz/sites/default/files/uploads/20200828TSA-logo-PRIMARY-Large.png',
        charityPhoto: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '🛡️',
        totalReceived: 2450000,
        donationCount: 15600,
        verified: true,
        impact: {
          familiesSupported: '120,000',
          mealsProvided: '2.4M',
          servicesOffered: '450'
        },
        milestones: [
          { title: 'Emergency housing for 500 families', progress: 68, target: 800000, raised: 544000 },
          { title: 'Mobile food services expansion', progress: 85, target: 200000, raised: 170000 },
          { title: 'Youth mentorship program funding', progress: 34, target: 150000, raised: 51000 }
        ]
      },
      {
        id: '3',
        name: 'Starship Foundation',
        description: 'Supporting NZ\'s national children\'s hospital. $160M+ raised since 1992 for world-class pediatric healthcare and research.',
        fullDescription: 'Starship Foundation exists to enhance the health and wellbeing of all children and young people across New Zealand by supporting Starship Children\'s Hospital.\n\nWe fund world-class medical equipment, groundbreaking research, and innovative treatments that give children the best possible chance at life. Our support extends to family facilities, mental health services, and specialist pediatric training.\n\nEvery year, Starship treats over 145,000 children from across New Zealand and the Pacific. Your donation helps ensure every child receives the best possible care.',
        category: 'Health',
        location: 'Auckland, NZ',
        website: 'https://starship.org.nz',
        logoUrl: 'https://www.starship.org.nz/wp-content/uploads/2023/01/starship-foundation-logo.png',
        charityPhoto: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '⭐',
        totalReceived: 1850000,
        donationCount: 12400,
        verified: true,
        impact: {
          childrenTreated: '145,000',
          familiesSupported: '58,000',
          researchProjects: '47'
        },
        milestones: [
          { title: 'New pediatric MRI scanner', progress: 89, target: 2500000, raised: 2225000 },
          { title: 'Mental health support expansion', progress: 56, target: 400000, raised: 224000 },
          { title: 'Pacific Islands outreach program', progress: 23, target: 180000, raised: 41400 }
        ]
      },
      {
        id: '4',
        name: 'Forest & Bird',
        description: 'NZ\'s leading independent conservation organisation since 1923. Protecting indigenous flora, fauna and natural ecosystems.',
        fullDescription: 'Forest & Bird has been New Zealand\'s voice for nature for 100 years. We protect native forests, birds, and marine life through advocacy, research, and hands-on conservation work.\n\nOur work spans from lobbying for stronger environmental laws to hands-on predator control, habitat restoration, and species monitoring. We manage nature reserves and coordinate thousands of volunteers in conservation projects.\n\nWith climate change and biodiversity loss accelerating, our work has never been more critical. We\'re fighting to ensure New Zealand\'s unique wildlife survives and thrives for future generations.',
        category: 'Environment',
        location: 'National, NZ',
        website: 'https://forestandbird.org.nz',
        logoUrl: 'https://www.forestandbird.org.nz/sites/default/files/2019-04/FB-logo-green-2019.png',
        charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90bi1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '🦜',
        totalReceived: 890000,
        donationCount: 5600,
        verified: true,
        impact: {
          hectaresProtected: '2,300',
          speciesMonitored: '156',
          volunteersActive: '8,500'
        },
        milestones: [
          { title: 'Predator-proof fence for takahē sanctuary', progress: 76, target: 350000, raised: 266000 },
          { title: 'Kākāpō habitat restoration project', progress: 45, target: 120000, raised: 54000 },
          { title: 'Marine reserve monitoring equipment', progress: 12, target: 95000, raised: 11400 }
        ]
      },
      {
        id: '5',
        name: 'KidsCan',
        description: 'NZ\'s leading children\'s charity. Providing food, clothing and health items to 60,000+ Kiwi kids daily since 2005.',
        fullDescription: 'KidsCan provides essentials to Kiwi kids in need so they can focus on learning. We work with schools in low socio-economic communities to provide food, clothing, shoes, and health products.\n\nOur programs include daily food for hungry children, raincoats and shoes for winter, health products, and head lice treatments. We support over 1,000 schools nationwide, reaching children who might otherwise go without.\n\nEvery child deserves the basics they need to learn and thrive. Your donation helps level the playing field for New Zealand\'s most vulnerable children.',
        category: 'Education',
        location: 'Auckland, NZ',
        website: 'https://kidscan.org.nz',
        logoUrl: 'https://www.kidscan.org.nz/wp-content/uploads/2023/03/KidsCan-Logo-Horizontal-Colour.png',
        charityPhoto: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '👶',
        totalReceived: 675000,
        donationCount: 4200,
        verified: true,
        impact: {
          childrenSupported: '60,000',
          schoolsServed: '1,000',
          itemsProvided: '3.2M'
        },
        milestones: [
          { title: 'Winter clothing for 5,000 children', progress: 92, target: 125000, raised: 115000 },
          { title: 'Expand breakfast program to 100 new schools', progress: 67, target: 80000, raised: 53600 },
          { title: 'Health and hygiene supplies fund', progress: 38, target: 60000, raised: 22800 }
        ]
      },
      {
        id: '6',
        name: 'Red Cross New Zealand',
        description: 'Part of the world\'s largest humanitarian network. Disaster relief, refugee support, first aid training, and community services.',
        fullDescription: 'Red Cross New Zealand is part of the world\'s largest humanitarian movement, helping people in crisis without discrimination. We provide disaster relief, support refugees and asylum seekers, and deliver community services.\n\nOur emergency response teams are ready 24/7 to help communities affected by floods, earthquakes, fires, and other disasters. We provide practical support, emotional care, and help people rebuild their lives.\n\nWe also deliver first aid training, international humanitarian law education, and work to build resilient communities that can better prepare for and respond to emergencies.',
        category: 'Emergency Relief',
        location: 'National, NZ',
        website: 'https://redcross.org.nz',
        logoUrl: 'https://www.redcross.org.nz/assets/Logos/nzrc-logo-digital.png',
        charityPhoto: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '➕',
        totalReceived: 1200000,
        donationCount: 8900,
        verified: true,
        impact: {
          peopleAssisted: '25,000',
          emergencyResponses: '850',
          communitiesServed: '180'
        },
        milestones: [
          { title: 'Emergency relief supplies stockpile', progress: 58, target: 200000, raised: 116000 },
          { title: 'Mobile disaster response units', progress: 73, target: 450000, raised: 328500 },
          { title: 'Refugee integration support program', progress: 29, target: 75000, raised: 21750 }
        ]
      }
    ];
    
    res.json({ success: true, data: staticCharities });
  } catch (error) {
    console.error('Error fetching charities:', error);
    
    // Return static data even if database fails
    const staticCharities = [
      {
        id: '1',
        name: 'Isbjorn Arctic Conservation',
        description: 'Leading the fight to protect Arctic ice and polar bear habitats through scientific research and direct conservation action.',
        fullDescription: 'Since 2019, Isbjorn has been at the forefront of Arctic conservation efforts. Our mission is to protect polar bear habitats and Arctic ice through cutting-edge scientific research, community engagement, and direct conservation action.',
        category: 'Environment',
        location: 'Auckland, NZ',
        website: 'https://isbjorn.co.nz',
        logoUrl: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5).png',
        charityPhoto: 'https://images.unsplash.com/photo-1551446591-142875a901a1?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '🐻‍❄️',
        totalReceived: 125000,
        donationCount: 847,
        verified: true,
        impact: {
          bearsHelped: '142',
          iceProtected: '5,200 km²',
          researchProjects: '18'
        },
        milestones: [
          { title: 'Fund 100 polar bear tracking collars', progress: 72, target: 150000, raised: 108000 },
          { title: 'Establish new Arctic research station', progress: 41, target: 300000, raised: 123000 },
          { title: 'Community conservation grants program', progress: 19, target: 80000, raised: 15200 }
        ]
      }
    ];
    
    res.json({ success: true, data: staticCharities });
  }
});

export default router;