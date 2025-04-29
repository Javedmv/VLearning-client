import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer:React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-fuchsia-900" />
              <span className="text-2xl font-bold text-white">VLearning</span>
            </div>
            <p className="text-sm">
              Empowering minds through innovative online learning experiences. Join our global community of learners today.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-pink-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Courses', href: '/course' },
                { name: 'About Us', href: '/about-us' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'Contact Us', href: '/contact-us' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="hover:text-blue-400 transition-colors text-sm text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <span className="text-sm">123 Learning Street, Education City, EC 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-sm">contact@vlearning.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              © {currentYear} VLearning. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;