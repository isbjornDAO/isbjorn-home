import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ice-900 text-ice-100 mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <div className="mb-4">
              <Logo size="medium" className="brightness-0 invert" />
            </div>
            <div className="mt-4 flex space-x-4">
              <a href="https://twitter.com/isbjorn" className="text-ice-400 hover:text-ice-100 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://linkedin.com/company/isbjorn" className="text-ice-400 hover:text-ice-100 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/donate" className="text-ice-400 hover:text-ice-100 transition-colors">Donate Now</Link></li>
              <li><Link to="/register" className="text-ice-400 hover:text-ice-100 transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="text-ice-400 hover:text-ice-100 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="mailto:help@isbjorn.co.nz" className="text-ice-400 hover:text-ice-100 transition-colors">Contact Us</a></li>
              <li><a href="/help" className="text-ice-400 hover:text-ice-100 transition-colors">Help</a></li>
              <li><a href="/terms" className="text-ice-400 hover:text-ice-100 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-ice-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-xs text-ice-400 text-center sm:text-left">
              <span>© {currentYear} Isbjorn Foundation</span>
              <span className="hidden sm:inline">•</span>
              <span>New Zealand Charity #12345678</span>
              <span className="hidden sm:inline">•</span>
              <span>Powered by Avalanche</span>
            </div>
            <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 text-xs">
              <a href="/privacy" className="text-ice-400 hover:text-ice-100 transition-colors">Privacy</a>
              <a href="/terms" className="text-ice-400 hover:text-ice-100 transition-colors">Terms</a>
              <a href="/cookies" className="text-ice-400 hover:text-ice-100 transition-colors">Cookies</a>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 text-xs text-ice-500 text-center">
            <p className="break-words">Blockchain transactions verified on Avalanche C-Chain • Gas fees under $0.01 • 100% transparent fund allocation</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;