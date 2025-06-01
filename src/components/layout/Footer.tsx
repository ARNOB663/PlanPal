import React from 'react';
import { Github, Heart, Twitter, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-xl font-bold flex items-center space-x-2">
              <span className="text-teal-400">Meet</span>
              <span className="text-white">Buddy</span>
            </Link>
            <p className="mt-3 text-gray-400">
              Find companions for events, trips, and activities. Never miss out on experiences because you don't have someone to go with.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-teal-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/create-event" className="text-gray-400 hover:text-teal-400 transition-colors">Create Event</Link>
              </li>
              <li>
                <Link to="/messages" className="text-gray-400 hover:text-teal-400 transition-colors">Messages</Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-teal-400 transition-colors">Profile</Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4 text-lg">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-teal-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-teal-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-400 hover:text-teal-400 transition-colors">Safety Guidelines</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-teal-400 transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <p className="text-gray-400 mb-2">Have questions or feedback?</p>
            <Link 
              to="/contact" 
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors mb-4"
            >
              Contact Support
            </Link>
            <p className="text-gray-400 flex items-center">
              <Heart size={16} className="mr-2 text-pink-500" /> Made with love
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} MeetBuddy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;