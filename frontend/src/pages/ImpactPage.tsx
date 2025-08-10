import React from 'react';
import IggyMascot from '@/components/IggyMascot';

const ImpactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <IggyMascot size="large" animated mood="celebrating" className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-ice-900 font-display mb-4">
            Our Conservation Impact
          </h1>
          <p className="text-xl text-ice-600 max-w-3xl mx-auto">
            See the real-time impact of donations on Arctic conservation efforts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Polar Bears Helped", value: "2,847", trend: "up" },
            { label: "Arctic Ice Protected (km²)", value: "15,432", trend: "up" },
            { label: "Conservation Projects", value: "28", trend: "stable" },
            { label: "Corporate Partners", value: "156", trend: "up" }
          ].map((stat, index) => (
            <div key={index} className="card p-6 text-center">
              <div className="text-3xl font-bold text-arctic-600 font-display mb-2">
                {stat.value}
              </div>
              <div className="text-ice-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-semibold mb-6">Impact Timeline</h2>
          <p className="text-ice-600">Detailed impact metrics coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default ImpactPage;