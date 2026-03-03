import React from 'react';
import SvalbardMissionWidget from '@/components/SvalbardMissionWidget';

const TestSvalbardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-cyan-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🐻‍❄️ Svalbard Mission Test Page
        </h1>

        <div className="bg-white rounded-lg p-4 mb-8">
          <h2 className="text-lg font-bold mb-2">Testing Checklist:</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>✅ If you see this page, React is working</li>
            <li>✅ If the widget below loads, the component exists</li>
            <li>✅ If you see mission data, the API is connected</li>
            <li>✅ If progress bar shows, everything works!</li>
          </ul>
        </div>

        <SvalbardMissionWidget />

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-white underline hover:text-blue-200"
          >
            ← Back to HomePage
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestSvalbardPage;
