import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { NavLink, Link } from 'react-router-dom';
import eventdekhoLogo from '../assets/images/eventdekho-logo.png';

function FooterComp() {
  return (
    <footer className="bg-gray-200 text-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Tagline */}
        <div>
          <Link to='/' className='font-bold text-xl hidden lg:block'><img src={eventdekhoLogo} alt="logo" className='h-15'/></Link>
          <p className="mt-2 text-sm">India's largest college event platform.</p>
          
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-semibold mb-2">Explore</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <NavLink to="/" className="hover:underline">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" className="hover:underline">
                Events
              </NavLink>
            </li>
            <li>
              <NavLink to="/colleges" className="hover:underline">
                Colleges
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className="hover:underline">
                Contact
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p className="text-sm">Email: mahemudborgave@gmail.com</p>
          <p className="text-sm">Phone: +91-7775841645</p>
        </div>

        {/* Social Icons */}
        <div>
          <h3 className="font-semibold mb-2">Follow Us</h3>
          <div className="flex space-x-4 mt-2">
            <a href="#"><FaFacebookF className="hover:text-black" /></a>
            <a href="#"><FaInstagram className="hover:text-black" /></a>
            <a href="#"><FaTwitter className="hover:text-black" /></a>
            <a href="#"><FaLinkedinIn className="hover:text-black" /></a>
          </div>
        </div>
      </div>


      <div className="text-center text-sm bg-gray-300 py-4">
        © {new Date().getFullYear()} EventDekho. All rights reserved. <br></br>{"{"} Designed by mahemud ❤️ {"}"}
      </div>
    </footer>
  );
}


export default FooterComp;