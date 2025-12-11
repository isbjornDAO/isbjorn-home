import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { API_URL } from '@/utils/apiUrl';
import { useAuth } from '@/contexts/AuthContext';

const DonationForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Top Environmental Charities and Essential NGOs
  const famousNGOs = [
    // Core charities to keep
    {
      id: 'isbjorn',
      name: 'Isbjorn',
      category: 'Climate',
      country: 'Global',
      location: 'Worldwide',
      description: 'Leading the fight against climate change through innovative blockchain-based climate action and transparency.',
      charityPhoto: 'https://images.unsplash.com/photo-1483794344563-d27a8d18014e?w=800',
      icon: 'https://logo.clearbit.com/isbjorn.io',
      verified: true,
      totalReceived: 5200000,
      donationCount: 68400,
      followerCount: 95200,
      trending: true,
      followerIncrease: 2400
    },
    {
      id: 'forest-and-bird',
      name: 'Forest & Bird',
      category: 'Conservation',
      country: 'New Zealand',
      location: 'Wellington',
      description: 'New Zealand\'s leading independent conservation organization protecting native wildlife, forests, and oceans.',
      charityPhoto: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
      icon: 'https://logo.clearbit.com/forestandbird.org.nz',
      verified: true,
      totalReceived: 2800000,
      donationCount: 42100,
      followerCount: 58700,
      trending: true,
      followerIncrease: 890
    },
    {
      id: 'red-cross',
      name: 'International Red Cross',
      category: 'Humanitarian',
      country: 'Switzerland',
      location: 'Geneva',
      description: 'Global humanitarian network providing emergency assistance, disaster relief, and education worldwide.',
      charityPhoto: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
      icon: 'https://logo.clearbit.com/icrc.org',
      verified: true,
      totalReceived: 8900000,
      donationCount: 124500,
      followerCount: 185000
    },
    {
      id: 'salvation-army',
      name: 'The Salvation Army',
      category: 'Humanitarian',
      country: 'United Kingdom',
      location: 'London',
      description: 'International charitable organization providing social services, disaster relief, and community support.',
      charityPhoto: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
      icon: 'https://logo.clearbit.com/salvationarmy.org',
      verified: true,
      totalReceived: 7200000,
      donationCount: 98600,
      followerCount: 142000
    },

    // Top Environmental Charities
    {
      id: 'wwf',
      name: 'World Wide Fund for Nature (WWF)',
      category: 'Wildlife',
      country: 'Switzerland',
      location: 'Gland',
      description: 'Leading conservation organization working to protect wildlife, halt deforestation, and combat climate change globally.',
      charityPhoto: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
      icon: 'https://logo.clearbit.com/worldwildlife.org',
      verified: true,
      totalReceived: 6500000,
      donationCount: 89200,
      followerCount: 156000,
      trending: true,
      followerIncrease: 3200
    },
    {
      id: 'greenpeace',
      name: 'Greenpeace International',
      category: 'Environment',
      country: 'Netherlands',
      location: 'Amsterdam',
      description: 'Global campaigning organization using peaceful protest and creative communication to expose environmental problems.',
      charityPhoto: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
      icon: 'https://logo.clearbit.com/greenpeace.org',
      verified: true,
      totalReceived: 5800000,
      donationCount: 76300,
      followerCount: 134000,
      trending: true,
      followerIncrease: 1800
    },
    {
      id: 'nature-conservancy',
      name: 'The Nature Conservancy',
      category: 'Conservation',
      country: 'United States',
      location: 'Arlington, VA',
      description: 'Protecting ecologically important lands and waters through science-based conservation solutions worldwide.',
      charityPhoto: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
      icon: 'https://logo.clearbit.com/nature.org',
      verified: true,
      totalReceived: 6200000,
      donationCount: 82400,
      followerCount: 148000
    },
    {
      id: 'conservation-international',
      name: 'Conservation International',
      category: 'Conservation',
      country: 'United States',
      location: 'Arlington, VA',
      description: 'Protecting nature for the benefit of humanity through science, partnerships, and field demonstration.',
      charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      icon: 'https://logo.clearbit.com/conservation.org',
      verified: true,
      totalReceived: 4900000,
      donationCount: 64800,
      followerCount: 112000
    },
    {
      id: 'edf',
      name: 'Environmental Defense Fund',
      category: 'Climate',
      country: 'United States',
      location: 'New York, NY',
      description: 'Creating transformational solutions to the most serious environmental problems using science, economics, and law.',
      charityPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
      icon: 'https://logo.clearbit.com/edf.org',
      verified: true,
      totalReceived: 4600000,
      donationCount: 61200,
      followerCount: 98500
    },
    {
      id: 'nrdc',
      name: 'Natural Resources Defense Council',
      category: 'Environment',
      country: 'United States',
      location: 'New York, NY',
      description: 'Safeguarding the earth through law, science, and the support of millions of people worldwide.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/nrdc.org',
      verified: true,
      totalReceived: 4300000,
      donationCount: 58900,
      followerCount: 92800
    },
    {
      id: 'sierra-club',
      name: 'Sierra Club',
      category: 'Environment',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'America\'s largest grassroots environmental organization exploring, enjoying, and protecting the planet.',
      charityPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      icon: 'https://logo.clearbit.com/sierraclub.org',
      verified: true,
      totalReceived: 3800000,
      donationCount: 52400,
      followerCount: 86500
    },
    {
      id: 'rainforest-alliance',
      name: 'Rainforest Alliance',
      category: 'Forest',
      country: 'United States',
      location: 'New York, NY',
      description: 'Working to conserve biodiversity and ensure sustainable livelihoods by transforming land-use practices.',
      charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      icon: 'https://logo.clearbit.com/rainforest-alliance.org',
      verified: true,
      totalReceived: 3600000,
      donationCount: 49800,
      followerCount: 78900
    },
    {
      id: 'ocean-conservancy',
      name: 'Ocean Conservancy',
      category: 'Ocean',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Working to protect the ocean from today\'s greatest global challenges through science-based solutions.',
      charityPhoto: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      icon: 'https://logo.clearbit.com/oceanconservancy.org',
      verified: true,
      totalReceived: 3200000,
      donationCount: 44600,
      followerCount: 71200
    },
    {
      id: 'wildlife-conservation-society',
      name: 'Wildlife Conservation Society',
      category: 'Wildlife',
      country: 'United States',
      location: 'New York, NY',
      description: 'Saving wildlife and wild places worldwide through science, conservation action, and education.',
      charityPhoto: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800',
      icon: 'https://logo.clearbit.com/wcs.org',
      verified: true,
      totalReceived: 4100000,
      donationCount: 56700,
      followerCount: 88400
    },
    {
      id: 'oceana',
      name: 'Oceana',
      category: 'Ocean',
      country: 'United States',
      location: 'Washington, DC',
      description: 'The largest international advocacy organization focused solely on ocean conservation.',
      charityPhoto: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
      icon: 'https://logo.clearbit.com/oceana.org',
      verified: true,
      totalReceived: 3400000,
      donationCount: 47100,
      followerCount: 74800
    },
    {
      id: '350org',
      name: '350.org',
      category: 'Climate',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'Building a global grassroots climate movement that can hold leaders accountable to science and justice.',
      charityPhoto: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      icon: 'https://logo.clearbit.com/350.org',
      verified: true,
      totalReceived: 2900000,
      donationCount: 41800,
      followerCount: 68200
    },
    {
      id: 'earthjustice',
      name: 'Earthjustice',
      category: 'Environment',
      country: 'United States',
      location: 'San Francisco, CA',
      description: 'The premier nonprofit environmental law organization fighting for a healthy environment in the courts.',
      charityPhoto: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800',
      icon: 'https://logo.clearbit.com/earthjustice.org',
      verified: true,
      totalReceived: 3100000,
      donationCount: 43200,
      followerCount: 65400
    },
    {
      id: 'friends-of-earth',
      name: 'Friends of the Earth International',
      category: 'Environment',
      country: 'Netherlands',
      location: 'Amsterdam',
      description: 'Grassroots environmental network campaigning on today\'s most urgent environmental and social issues.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/foei.org',
      verified: true,
      totalReceived: 2700000,
      donationCount: 38900,
      followerCount: 59600
    },
    {
      id: 'coral-reef-alliance',
      name: 'Coral Reef Alliance',
      category: 'Ocean',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'Uniting communities to save coral reefs through innovative, community-centered approaches.',
      charityPhoto: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800',
      icon: 'https://logo.clearbit.com/coral.org',
      verified: true,
      totalReceived: 1800000,
      donationCount: 28400,
      followerCount: 42100
    },
    {
      id: 'rainforest-foundation',
      name: 'Rainforest Foundation',
      category: 'Forest',
      country: 'United States',
      location: 'New York, NY',
      description: 'Supporting indigenous peoples and traditional populations to protect their environment and rights.',
      charityPhoto: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      icon: 'https://logo.clearbit.com/rainforestfoundation.org',
      verified: true,
      totalReceived: 2100000,
      donationCount: 32600,
      followerCount: 48700
    },
    {
      id: 'waterkeeper-alliance',
      name: 'Waterkeeper Alliance',
      category: 'Water',
      country: 'United States',
      location: 'New York, NY',
      description: 'Uniting local Waterkeeper groups to defend communities\' right to clean water globally.',
      charityPhoto: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
      icon: 'https://logo.clearbit.com/waterkeeper.org',
      verified: true,
      totalReceived: 1900000,
      donationCount: 29700,
      followerCount: 44200
    },
    {
      id: 'earthworks',
      name: 'Earthworks',
      category: 'Environment',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Protecting communities and the environment from the adverse impacts of mineral and energy development.',
      charityPhoto: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800',
      icon: 'https://logo.clearbit.com/earthworks.org',
      verified: true,
      totalReceived: 1600000,
      donationCount: 24800,
      followerCount: 38500
    },
    {
      id: 'amazon-watch',
      name: 'Amazon Watch',
      category: 'Forest',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'Protecting the rainforest and advancing the rights of indigenous peoples in the Amazon Basin.',
      charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      icon: 'https://logo.clearbit.com/amazonwatch.org',
      verified: true,
      totalReceived: 2200000,
      donationCount: 34100,
      followerCount: 51800
    },
    {
      id: 'birdlife-international',
      name: 'BirdLife International',
      category: 'Wildlife',
      country: 'United Kingdom',
      location: 'Cambridge',
      description: 'Global partnership of conservation organizations working to conserve birds and their habitats.',
      charityPhoto: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800',
      icon: 'https://logo.clearbit.com/birdlife.org',
      verified: true,
      totalReceived: 3300000,
      donationCount: 45900,
      followerCount: 69800
    },
    {
      id: 'fauna-flora',
      name: 'Fauna & Flora International',
      category: 'Wildlife',
      country: 'United Kingdom',
      location: 'Cambridge',
      description: 'Acting to conserve threatened species and ecosystems worldwide, choosing solutions that are sustainable.',
      charityPhoto: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800',
      icon: 'https://logo.clearbit.com/fauna-flora.org',
      verified: true,
      totalReceived: 2600000,
      donationCount: 37200,
      followerCount: 54900
    },
    {
      id: 'sea-shepherd',
      name: 'Sea Shepherd Conservation Society',
      category: 'Ocean',
      country: 'United States',
      location: 'Friday Harbor, WA',
      description: 'International marine wildlife conservation organization engaging in direct action campaigns.',
      charityPhoto: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      icon: 'https://logo.clearbit.com/seashepherd.org',
      verified: true,
      totalReceived: 2800000,
      donationCount: 39400,
      followerCount: 62100,
      trending: true,
      followerIncrease: 1120
    },
    {
      id: 'surfrider',
      name: 'Surfrider Foundation',
      category: 'Ocean',
      country: 'United States',
      location: 'San Clemente, CA',
      description: 'Grassroots organization dedicated to the protection and enjoyment of the world\'s oceans, waves, and beaches.',
      charityPhoto: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
      icon: 'https://logo.clearbit.com/surfrider.org',
      verified: true,
      totalReceived: 1700000,
      donationCount: 27100,
      followerCount: 41600
    },
    {
      id: 'wilderness-society',
      name: 'The Wilderness Society',
      category: 'Conservation',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Protecting America\'s wilderness and inspiring Americans to care for wild places.',
      charityPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      icon: 'https://logo.clearbit.com/wilderness.org',
      verified: true,
      totalReceived: 2400000,
      donationCount: 35600,
      followerCount: 56700
    },
    {
      id: 'defenders-of-wildlife',
      name: 'Defenders of Wildlife',
      category: 'Wildlife',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Dedicated to the protection of all native animals and plants in their natural communities.',
      charityPhoto: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
      icon: 'https://logo.clearbit.com/defenders.org',
      verified: true,
      totalReceived: 2500000,
      donationCount: 36800,
      followerCount: 58300
    },
    {
      id: 'african-wildlife-foundation',
      name: 'African Wildlife Foundation',
      category: 'Wildlife',
      country: 'Kenya',
      location: 'Nairobi',
      description: 'Working with people across Africa to ensure wildlife and wild lands thrive in modern Africa.',
      charityPhoto: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      icon: 'https://logo.clearbit.com/awf.org',
      verified: true,
      totalReceived: 3500000,
      donationCount: 48200,
      followerCount: 72400
    },
    {
      id: 'elephant-crisis-fund',
      name: 'Elephant Crisis Fund',
      category: 'Wildlife',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Stopping the elephant poaching crisis and protecting their habitats through rapid response grants.',
      charityPhoto: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
      icon: 'https://logo.clearbit.com/elephantcrisisfund.org',
      verified: true,
      totalReceived: 1500000,
      donationCount: 23900,
      followerCount: 36800
    },
    {
      id: 'world-resources-institute',
      name: 'World Resources Institute',
      category: 'Environment',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Global research organization turning big ideas into action to sustain natural resources and protect the planet.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/wri.org',
      verified: true,
      totalReceived: 4200000,
      donationCount: 57600,
      followerCount: 84900
    },
    {
      id: 'climate-reality',
      name: 'The Climate Reality Project',
      category: 'Climate',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Committed to catalyzing a global solution to the climate crisis by making urgent action a necessity.',
      charityPhoto: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      icon: 'https://logo.clearbit.com/climaterealityproject.org',
      verified: true,
      totalReceived: 2300000,
      donationCount: 34800,
      followerCount: 53400,
      trending: true,
      followerIncrease: 1450
    },
    {
      id: 'clean-air-task-force',
      name: 'Clean Air Task Force',
      category: 'Climate',
      country: 'United States',
      location: 'Boston, MA',
      description: 'Pushing for changes in technologies and policies needed to achieve a zero-emissions, high-energy planet.',
      charityPhoto: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
      icon: 'https://logo.clearbit.com/catf.us',
      verified: true,
      totalReceived: 2000000,
      donationCount: 31200,
      followerCount: 47900
    },
    {
      id: 'rainforest-trust',
      name: 'Rainforest Trust',
      category: 'Forest',
      country: 'United States',
      location: 'Warrenton, VA',
      description: 'Saving endangered wildlife and protecting our planet by creating rainforest reserves through partnerships.',
      charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      icon: 'https://logo.clearbit.com/rainforesttrust.org',
      verified: true,
      totalReceived: 2700000,
      donationCount: 38600,
      followerCount: 57200
    },
    {
      id: 'plant-for-the-planet',
      name: 'Plant-for-the-Planet',
      category: 'Forest',
      country: 'Germany',
      location: 'Munich',
      description: 'Youth-initiated movement aimed at raising awareness and planting trees to fight the climate crisis.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/plant-for-the-planet.org',
      verified: true,
      totalReceived: 1400000,
      donationCount: 22700,
      followerCount: 35200
    },
    {
      id: 'rewilding-europe',
      name: 'Rewilding Europe',
      category: 'Conservation',
      country: 'Netherlands',
      location: 'Nijmegen',
      description: 'Making Europe a wilder place by creating rewilded landscapes in areas with great natural potential.',
      charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      icon: 'https://logo.clearbit.com/rewildingeurope.com',
      verified: true,
      totalReceived: 1800000,
      donationCount: 28900,
      followerCount: 43500
    },
    {
      id: 'sea-turtle-conservancy',
      name: 'Sea Turtle Conservancy',
      category: 'Wildlife',
      country: 'United States',
      location: 'Gainesville, FL',
      description: 'World\'s oldest sea turtle research and conservation organization protecting sea turtles through research.',
      charityPhoto: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      icon: 'https://logo.clearbit.com/conserveturtles.org',
      verified: true,
      totalReceived: 1300000,
      donationCount: 21400,
      followerCount: 33900
    },
    {
      id: 'polar-bears-international',
      name: 'Polar Bears International',
      category: 'Wildlife',
      country: 'United States',
      location: 'Bozeman, MT',
      description: 'Conserving polar bears and the sea ice they depend on through research, education, and action.',
      charityPhoto: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800',
      icon: 'https://logo.clearbit.com/polarbearsinternational.org',
      verified: true,
      totalReceived: 1600000,
      donationCount: 25300,
      followerCount: 39700
    },
    {
      id: 'audubon-society',
      name: 'National Audubon Society',
      category: 'Wildlife',
      country: 'United States',
      location: 'New York, NY',
      description: 'Protecting birds and the places they need through conservation, advocacy, education, and on-the-ground programs.',
      charityPhoto: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800',
      icon: 'https://logo.clearbit.com/audubon.org',
      verified: true,
      totalReceived: 3700000,
      donationCount: 51200,
      followerCount: 79600
    },
    {
      id: 'coral-restoration',
      name: 'Coral Restoration Foundation',
      category: 'Ocean',
      country: 'United States',
      location: 'Key Largo, FL',
      description: 'Restoring coral reefs through large-scale cultivation and outplanting of native coral species.',
      charityPhoto: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800',
      icon: 'https://logo.clearbit.com/coralrestoration.org',
      verified: true,
      totalReceived: 1200000,
      donationCount: 20100,
      followerCount: 31800
    },
    {
      id: 'rewilding-britain',
      name: 'Rewilding Britain',
      category: 'Conservation',
      country: 'United Kingdom',
      location: 'England',
      description: 'Championing a bold new approach to nature conservation, enabling natural processes and species to flourish.',
      charityPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
      icon: 'https://logo.clearbit.com/rewildingbritain.org.uk',
      verified: true,
      totalReceived: 1500000,
      donationCount: 24200,
      followerCount: 37400
    },
    {
      id: 'earthwatch',
      name: 'Earthwatch Institute',
      category: 'Environment',
      country: 'United States',
      location: 'Boston, MA',
      description: 'Engaging people worldwide in scientific field research to promote understanding and action for a sustainable environment.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/earthwatch.org',
      verified: true,
      totalReceived: 1900000,
      donationCount: 30400,
      followerCount: 46200
    },
    {
      id: 'planet-wild',
      name: 'Planet Wild',
      category: 'Conservation',
      country: 'Austria',
      location: 'Vienna',
      description: 'Crowdfunding conservation by enabling a global community to take direct action for nature.',
      charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      icon: 'https://logo.clearbit.com/planetwild.com',
      verified: true,
      totalReceived: 980000,
      donationCount: 18700,
      followerCount: 28500
    },
    {
      id: 'ocean-cleanup',
      name: 'The Ocean Cleanup',
      category: 'Ocean',
      country: 'Netherlands',
      location: 'Rotterdam',
      description: 'Developing advanced technologies to rid the oceans of plastic pollution.',
      charityPhoto: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800',
      icon: 'https://logo.clearbit.com/theoceancleanup.com',
      verified: true,
      totalReceived: 4500000,
      donationCount: 62300,
      followerCount: 96800,
      trending: true,
      followerIncrease: 4100
    },
    {
      id: 'carbon-180',
      name: 'Carbon180',
      category: 'Climate',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'Accelerating carbon removal solutions to address climate change and restore balance to the atmosphere.',
      charityPhoto: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
      icon: 'https://logo.clearbit.com/carbon180.org',
      verified: true,
      totalReceived: 1100000,
      donationCount: 19800,
      followerCount: 30600
    },
    {
      id: 'tree-sisters',
      name: 'TreeSisters',
      category: 'Forest',
      country: 'United Kingdom',
      location: 'Bristol',
      description: 'Global network of women restoring tropical forests by funding tree-planting projects around the world.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/treesisters.org',
      verified: true,
      totalReceived: 1350000,
      donationCount: 22100,
      followerCount: 34200
    },
  ];

  // Load charities from API
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await fetch(`${API_URL}/public/charities`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          setCharities(result.data);
        } else {
          // Fallback to famous NGOs
          setCharities(famousNGOs);
        }
      } catch (err) {
        console.error('Failed to fetch charities:', err);
        // Fallback to famous NGOs
        setCharities(famousNGOs);
      } finally {
        setLoading(false);
      }
    };

    fetchCharities();
  }, []);

  const handleLearnMore = (charityId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking the follow button
    if ((e.target as HTMLElement).closest('.follow-button')) {
      return;
    }
    navigate(`/charity/${charityId}`);
  };

  const handleFollowToggle = (charityId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please sign in to follow charities');
      return;
    }

    setFollowingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(charityId)) {
        newSet.delete(charityId);
        // Update follower count
        setCharities(charities.map(c =>
          c.id === charityId
            ? { ...c, followerCount: (c.followerCount || 0) - 1 }
            : c
        ));
      } else {
        newSet.add(charityId);
        // Update follower count
        setCharities(charities.map(c =>
          c.id === charityId
            ? { ...c, followerCount: (c.followerCount || 0) + 1 }
            : c
        ));
      }
      return newSet;
    });
  };


  return (
    <div className="min-h-screen bg-ice-50">
      <div className="relative bg-gradient-to-r from-arctic-500 to-polar-500 text-white py-12 sm:py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200)`,
            backgroundPosition: "center 40%"
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3 sm:mb-4">
            Choose a Charity
          </h1>
          <p className="text-lg sm:text-xl text-ice-100 max-w-3xl mx-auto px-4">
            Support verified charities worldwide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arctic-600"></div>
            <span className="ml-3 text-ice-600">Loading charities...</span>
          </div>
        )}


        {/* Icon-Focused Charity Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {charities.map((charity) => {
              const isFollowing = followingIds.has(charity.id);

              return (
                <div
                  key={charity.id}
                  onClick={(e) => handleLearnMore(charity.id, e)}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-ice-100 hover:border-arctic-200 flex flex-col h-full cursor-pointer"
                >
                  {/* Hero Image */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={charity.charityPhoto}
                      alt={`${charity.name} charitable work`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Verification Badge */}
                    {charity.verified && (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4" style={{ backgroundColor: '#3b82f6' }}>
                        <div className="text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Verified</span>
                          <span className="sm:hidden">✓</span>
                        </div>
                      </div>
                    )}

                    {/* Trending Badge */}
                    {charity.trending && charity.followerIncrease && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-orange-500 to-red-500">
                        <div className="text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center shadow-lg">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                          </svg>
                          <span>+{(charity.followerIncrease / 1000).toFixed(1)}k</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    {/* Header with Logo and Follow Button */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Logo next to name */}
                        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-100 p-2">
                          <img
                            src={charity.icon}
                            alt={`${charity.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-lg sm:text-xl font-bold" style="color: #3b82f6">${charity.name.charAt(0)}</span>`;
                              }
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ color: '#3b82f6' }}>
                            {charity.name}
                          </h3>
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
                            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#3b82f6' }}></span>
                            <span className="truncate">{charity.category} • {charity.country || charity.location || 'New Zealand'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Follow Button */}
                      <button
                        onClick={(e) => handleFollowToggle(charity.id, e)}
                        className={`follow-button flex-shrink-0 ml-2 p-2 rounded-full transition-all ${
                          isFollowing
                            ? 'text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={isFollowing ? { backgroundColor: '#3b82f6' } : {}}
                        title={isFollowing ? 'Following' : 'Follow for updates'}
                      >
                        {isFollowing ? (
                          <BellSolidIcon className="w-5 h-5" />
                        ) : (
                          <BellIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-arctic-700 text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-3">
                      {charity.description}
                    </p>

                    {/* Spacer to push stats and buttons to bottom */}
                    <div className="flex-1"></div>

                    {/* Stats Grid - 3 columns */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-ice-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-arctic-900">
                          ${(charity.totalReceived / 1000).toFixed(0)}k
                        </div>
                        <div className="text-xs text-arctic-500">Raised</div>
                      </div>
                      <div className="text-center p-2 bg-ice-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-arctic-900">
                          {(charity.donationCount / 1000).toFixed(1)}k
                        </div>
                        <div className="text-xs text-arctic-500">Donations</div>
                      </div>
                      <div className="text-center p-2 bg-arctic-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-arctic-900 flex items-center justify-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          {charity.followerCount ? (charity.followerCount / 1000).toFixed(1) + 'k' : '0'}
                        </div>
                        <div className="text-xs text-arctic-500">Followers</div>
                      </div>
                    </div>

                    {/* Click hint */}
                    <div className="mt-2 text-center text-sm text-arctic-600">Click to learn more & donate</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Donation modal removed: click a card to open details with payment */}
    </div>
  );
};

const DonatePage: React.FC = () => {
  return <DonationForm />;
};

export default DonatePage;
