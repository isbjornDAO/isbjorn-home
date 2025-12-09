"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Charity_model_1 = require("../models/Charity.model");
const IRDCompliantDonation_model_1 = require("../models/IRDCompliantDonation.model");
const NZCompany_model_1 = require("../models/NZCompany.model");
const logger_1 = require("../utils/logger");
const nzbn_search_1 = __importDefault(require("./nzbn-search"));
const router = express_1.default.Router();
const isProduction = process.env.NODE_ENV === 'production';
router.get('/charities', async (req, res) => {
    try {
        // Prefer real charities from the database
        const charities = await Charity_model_1.Charity.findAll({
            where: { isActive: true },
            attributes: [
                'id',
                'name',
                'description',
                'category',
                'website',
                'logoUrl',
                'charityPhoto',
                'icon',
                'location',
                'totalReceived',
                'donationCount',
            ],
            order: [['name', 'ASC']],
            limit: 200,
        });
        if (charities.length > 0) {
            res.json({ success: true, data: charities });
            return;
        }
        // In non-production, fall back to static data with images and emojis for demo/dev
        if (isProduction) {
            res.json({ success: true, data: [] });
            return;
        }
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
                totalReceived: 0,
                donationCount: 0,
                verified: true
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
                totalReceived: 0,
                donationCount: 0,
                verified: true
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
                totalReceived: 0,
                donationCount: 0,
                verified: true
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
                totalReceived: 0,
                donationCount: 0,
                verified: true
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
                totalReceived: 0,
                donationCount: 0,
                verified: true
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
                totalReceived: 0,
                donationCount: 0,
                verified: true
            }
        ];
        res.json({ success: true, data: staticCharities });
    }
    catch (error) {
        logger_1.logger.error('Error fetching charities:', error);
        if (isProduction) {
            res.status(500).json({ success: false, message: 'Failed to load charities' });
            return;
        }
        // In non-production, return static data even if database fails
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
                totalReceived: 0,
                donationCount: 0,
                verified: true
            }
        ];
        res.json({ success: true, data: staticCharities });
    }
});
// Admin endpoint to reset charity stats (protected by secret key)
router.post('/admin/reset-charity-stats', async (req, res) => {
    try {
        const adminKey = req.headers['x-admin-key'] || req.query.key;
        const expectedKey = process.env.ADMIN_SECRET_KEY || 'isbjorn-reset-2024';
        if (adminKey !== expectedKey) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        await Charity_model_1.Charity.update({ totalReceived: 0, donationCount: 0 }, { where: {} });
        const charities = await Charity_model_1.Charity.findAll({
            attributes: ['name', 'totalReceived', 'donationCount']
        });
        logger_1.logger.info('Charity stats reset via admin endpoint');
        res.json({
            success: true,
            message: 'All charity stats reset to 0',
            charities: charities.map(c => ({
                name: c.name,
                totalReceived: c.totalReceived,
                donationCount: c.donationCount
            }))
        });
    }
    catch (error) {
        logger_1.logger.error('Error resetting charity stats:', error);
        res.status(500).json({ success: false, message: 'Failed to reset stats' });
    }
});
// Public stats for homepage (no mock numbers)
router.get('/stats', async (req, res) => {
    try {
        const [charityCount, donationCount, totalDonatedRaw, companyCount] = await Promise.all([
            Charity_model_1.Charity.count({ where: { isActive: true } }),
            IRDCompliantDonation_model_1.IRDCompliantDonation.count(),
            IRDCompliantDonation_model_1.IRDCompliantDonation.sum('donationAmountNzd'),
            NZCompany_model_1.NZCompany.count({ where: { isVerified: true } }),
        ]);
        const totalDonatedNzd = Number(totalDonatedRaw || 0);
        res.json({
            success: true,
            data: {
                registeredCharities: charityCount,
                donationsProcessed: donationCount,
                totalDonatedNzd,
                businessPartners: companyCount,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching public stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load stats',
        });
    }
});
// NZBN company search routes
router.use('/nzbn', nzbn_search_1.default);
exports.default = router;
//# sourceMappingURL=public.js.map