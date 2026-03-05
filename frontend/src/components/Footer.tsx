import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ice-900 text-ice-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <div className="mb-4">
              <Logo size="medium" className="brightness-0 invert" />
            </div>
            <p className="text-sm text-ice-400 max-w-sm leading-relaxed mb-5">
              Transparent blockchain donations for climate conservation. Every dollar tracked, every decision governed by donors.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/isbjorn" target="_blank" rel="noopener noreferrer" className="text-ice-400 hover:text-ice-100 transition-colors">
                <span className="sr-only">X (Twitter)</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com/company/isbjorn" target="_blank" rel="noopener noreferrer" className="text-ice-400 hover:text-ice-100 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-ice-300">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/donate" className="text-sm text-ice-400 hover:text-ice-100 transition-colors">Donate</Link></li>
              <li><Link to="/map" className="text-sm text-ice-400 hover:text-ice-100 transition-colors">Map</Link></li>
              <li><Link to="/live" className="text-sm text-ice-400 hover:text-ice-100 transition-colors">Live Cams</Link></li>
              <li><Link to="/vote" className="text-sm text-ice-400 hover:text-ice-100 transition-colors">Vote</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-ice-300">Support</h4>
            <ul className="space-y-2.5">
              <li><a href="mailto:help@isbjorn.co.nz" className="text-sm text-ice-400 hover:text-ice-100 transition-colors">Contact Us</a></li>
              <li><Link to="/system-status" className="text-sm text-ice-400 hover:text-ice-100 transition-colors">System Status</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-ice-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-xs text-ice-500 text-center sm:text-left">
              <span>&copy; {currentYear} Isbjorn Foundation</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>New Zealand Registered Charity</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Powered by Avalanche</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
