import React from 'react';
import IggyMascot from '@/components/IggyMascot';

const ProjectsPage: React.FC = () => {
  const projects = [
    {
      title: "Arctic Ice Monitoring",
      description: "Real-time tracking of ice sheet stability and polar bear habitat preservation across the Arctic Circle.",
      image: "https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg",
      funded: 75,
      goal: 50000
    },
    {
      title: "Polar Bear Sanctuary",
      description: "Establishing safe zones for polar bear families with 24/7 monitoring and protection services.",
      image: "https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg",
      funded: 60,
      goal: 75000
    },
    {
      title: "Climate Research Station",
      description: "Advanced weather monitoring stations to track climate change impact on Arctic ecosystems.",
      image: "https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg",
      funded: 40,
      goal: 100000
    },
    {
      title: "Community Education",
      description: "Educational programs for Arctic communities about conservation and sustainable practices.",
      image: "https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg",
      funded: 85,
      goal: 30000
    },
    {
      title: "Ice Core Analysis",
      description: "Scientific research using ice core samples to understand historical climate patterns.",
      image: "https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg",
      funded: 25,
      goal: 80000
    },
    {
      title: "Wildlife Rehabilitation",
      description: "Rescue and rehabilitation center for injured or displaced Arctic wildlife.",
      image: "https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg",
      funded: 90,
      goal: 60000
    }
  ];

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="relative bg-gradient-to-r from-arctic-500 to-polar-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <IggyMascot size="large" animated mood="thoughtful" className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold font-display mb-4">Active Conservation Projects</h1>
          <p className="text-xl text-ice-100 max-w-3xl mx-auto">
            Real projects making a real difference. Track exactly how your donations
            protect Arctic wildlife and preserve polar bear habitats.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-arctic-100 to-ice-200 rounded-lg mb-4 overflow-hidden relative">
                <img 
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-arctic-600/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-sm font-medium">{project.funded}% Funded</div>
                </div>
              </div>
              
              <h3 className="font-semibold text-xl text-ice-900 mb-3 font-display">
                {project.title}
              </h3>
              
              <p className="text-ice-600 mb-4 leading-relaxed">
                {project.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ice-600">Goal: ${project.goal.toLocaleString()}</span>
                  <span className="text-arctic-600 font-medium">${Math.round(project.goal * project.funded / 100).toLocaleString()} raised</span>
                </div>
                
                <div className="w-full bg-ice-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-arctic-500 to-polar-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(project.funded, 100)}%` }}
                  />
                </div>
                
                <button className="btn-primary w-full mt-4">
                  Support This Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;