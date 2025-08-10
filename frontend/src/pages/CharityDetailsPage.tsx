import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CharityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock charity data - in real app, fetch based on ID
  const charity = {
    id: '1',
    name: 'Isbjorn Arctic Conservation',
    description: 'Leading the fight to protect Arctic ice and polar bear habitats through scientific research and direct conservation action.',
    category: 'Environment',
    location: 'Auckland, NZ',
    verified: true,
    totalReceived: 125000,
    donationCount: 847,
    logoUrl: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5).png',
    fullDescription: `Isbjorn Arctic Conservation is dedicated to protecting polar bears and their Arctic habitat through scientific research, conservation action, and public education. 

Our work focuses on:
• Monitoring Arctic ice conditions and polar bear populations
• Supporting indigenous communities in conservation efforts  
• Funding research into climate change impacts on Arctic wildlife
• Educational programs about Arctic conservation

Every donation directly funds our conservation projects and helps protect this critical ecosystem for future generations.`,
    impact: {
      bearsHelped: 127,
      iceProtected: '2,500 km²',
      researchProjects: 8
    }
  };

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          to="/donate" 
          className="inline-flex items-center text-arctic-600 hover:text-arctic-700 mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Charities
        </Link>

        <div className="card p-8">
          <div className="flex items-start space-x-6 mb-8">
            <img
              src={charity.logoUrl}
              alt={`${charity.name} logo`}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-ice-900 font-display mb-2">
                {charity.name}
              </h1>
              <p className="text-lg text-ice-600 mb-4">{charity.location}</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-arctic-100 text-arctic-700">
                {charity.category}
              </span>
            </div>
          </div>

          <div className="prose max-w-none text-ice-700 mb-8">
            {charity.fullDescription.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-ice-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-arctic-600">{charity.impact.bearsHelped}</div>
              <div className="text-sm text-ice-600">Bears Helped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-arctic-600">{charity.impact.iceProtected}</div>
              <div className="text-sm text-ice-600">Ice Protected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-arctic-600">{charity.impact.researchProjects}</div>
              <div className="text-sm text-ice-600">Research Projects</div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button className="btn-primary flex-1">
              Donate Now
            </button>
            <button className="btn-ghost flex-1">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharityDetailsPage;