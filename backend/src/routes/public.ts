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
        category: 'Environment',
        location: 'Auckland, NZ',
        website: 'https://isbjorn.co.nz',
        logoUrl: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5).png',
        charityPhoto: 'https://images.unsplash.com/photo-1551446591-142875a901a1?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '🐻‍❄️',
        totalReceived: 125000,
        donationCount: 847,
        verified: true
      },
      {
        id: '2',
        name: 'The Salvation Army New Zealand',
        description: 'Fighting poverty and social distress since 1883. Providing budgeting advice, food assistance, and support to 120,000+ families annually.',
        category: 'Social Services',
        location: 'National, NZ',
        website: 'https://salvationarmy.org.nz',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjREMyNjI2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+U2FsdmF0aW9uPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkFybXk8L3RleHQ+Cjwvc3ZnPgo=',
        charityPhoto: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '🛡️',
        totalReceived: 2450000,
        donationCount: 15600,
        verified: true
      },
      {
        id: '3',
        name: 'Starship Foundation',
        description: 'Supporting NZ\'s national children\'s hospital. $160M+ raised since 1992 for world-class pediatric healthcare and research.',
        category: 'Health',
        location: 'Auckland, NZ',
        website: 'https://starship.org.nz',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA3N0JFIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTAwLDQwIDEyMCw4MCA4MCw4MCIgZmlsbD0iI0ZGRDcwMCIvPgo8dGV4dCB4PSIxMDAiIHk9IjEyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPlN0YXJzaGlwPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkZvdW5kYXRpb248L3RleHQ+Cjwvc3ZnPgo=',
        charityPhoto: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '⭐',
        totalReceived: 1850000,
        donationCount: 12400,
        verified: true
      },
      {
        id: '4',
        name: 'Forest & Bird',
        description: 'NZ\'s leading independent conservation organisation since 1923. Protecting indigenous flora, fauna and natural ecosystems.',
        category: 'Environment',
        location: 'National, NZ',
        website: 'https://forestandbird.org.nz',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMkU3RDMyIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSIxNSIgZmlsbD0iIzQ2QTA0RSIvPgo8cGF0aCBkPSJNODUgODVMOTUgOTVMOTAgMTAwTDEwMCAxMTBMMTEwIDEwMEwxMDUgOTVMMTE1IDg1Wk04NSA4NUw5MCA5MEw4NSA5NVoiIGZpbGw9IiM0NkEwNEUiLz4KPHR1ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+Rm9yZXN0ICZhbXA7PC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkJpcmQ8L3RleHQ+Cjwvc3ZnPgo=',
        charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '🦜',
        totalReceived: 890000,
        donationCount: 5600,
        verified: true
      },
      {
        id: '5',
        name: 'KidsCan',
        description: 'NZ\'s leading children\'s charity. Providing food, clothing and health items to 60,000+ Kiwi kids daily since 2005.',
        category: 'Education',
        location: 'Auckland, NZ',
        website: 'https://kidscan.org.nz',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2QjM1Ii8+CjxjaXJjbGUgY3g9IjkwIiBjeT0iNzAiIHI9IjEwIiBmaWxsPSIjRkZEOTAwIi8+CjxjaXJjbGUgY3g9IjExMCIgY3k9IjcwIiByPSIxMCIgZmlsbD0iI0ZGRDkwMCIvPgo8cGF0aCBkPSJNODAgODVIODVWOTBIODBaIiBmaWxsPSIjRkZEOTAwIi8+CjxwYXRoIGQ9Ik0xMTUgODVIMTIwVjkwSDExNVoiIGZpbGw9IiNGRkQ5MDAiLz4KPHR1ZXh0IHg9IjEwMCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+S2lkc0NhbjwvdGV4dD4KPC9zdmc+Cg==',
        charityPhoto: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '👶',
        totalReceived: 675000,
        donationCount: 4200,
        verified: true
      },
      {
        id: '6',
        name: 'Red Cross New Zealand',
        description: 'Part of the world\'s largest humanitarian network. Disaster relief, refugee support, first aid training, and community services.',
        category: 'Emergency Relief',
        location: 'National, NZ',
        website: 'https://redcross.org.nz',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNOTAgNjBIMTEwVjgwSDEyMFYxMDBIMTEwVjEyMEg5MFYxMDBIODBWODBIOTBWNjBaIiBmaWxsPSIjREMyNjI2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjREMyNjI2IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5SZWQgQ3Jvc3M8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjREMyNjI2IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5OZXcgWmVhbGFuZDwvdGV4dD4KPC9zdmc+Cg==',
        charityPhoto: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        icon: '➕',
        totalReceived: 1200000,
        donationCount: 8900,
        verified: true
      }
    ];
    
    res.json({ success: true, data: staticCharities });
  } catch (error) {
    console.error('Error fetching charities:', error);
    
    // Return static data even if database fails
    const staticCharities = [
      // Same static data as above...
      {
        id: '1',
        name: 'Isbjorn Arctic Conservation',
        description: 'Leading the fight to protect Arctic ice and polar bear habitats.',
        category: 'Environment',
        location: 'Auckland, NZ',
        logoUrl: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5).png',
        charityPhoto: 'https://images.unsplash.com/photo-1551446591-142875a901a1?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3',
        icon: '🐻‍❄️',
        totalReceived: 125000,
        donationCount: 847,
        verified: true
      }
    ];
    
    res.json({ success: true, data: staticCharities });
  }
});

export default router;