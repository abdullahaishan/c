import React from 'react';
import { Heart, Github, Linkedin, Twitter, Instagram, Facebook, Youtube, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeveloper } from '../context/DeveloperContext';
const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { isFreePlan, getAdminSocialLinks, publicDeveloper } = useDeveloper();

  const handleAdminClick = () => {
    navigate('/u/abdullah_aishan');
  };

  const adminLinks = getAdminSocialLinks();

  const socialIcons = [
    { icon: Github, link: adminLinks.github, label: 'GitHub' },
    { icon: Linkedin, link: adminLinks.linkedin, label: 'LinkedIn' },
    { icon: Twitter, link: adminLinks.twitter, label: 'Twitter' },
    { icon: Instagram, link: adminLinks.instagram, label: 'Instagram' },
    { icon: Facebook, link: adminLinks.facebook, label: 'Facebook' },
    { icon: Youtube, link: adminLinks.youtube, label: 'YouTube' },
    { icon: Mail, link: adminLinks.email, label: 'Email' },
  ].filter(item => item.link);

  return (
    <footer className="bg-gradient-to-t from-[#030014] to-transparent border-t border-white/10 pt-12 pb-6 px-[5%] relative">
      <div className="max-w-7xl mx-auto">
        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-8">
          {socialIcons.map((social, index) => (
            <a
              key={index}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              aria-label={social.label}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur opacity-0 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 group-hover:border-[#6366f1]/50">
                <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm flex items-center justify-center gap-1 flex-wrap">
            © {currentYear} All rights reserved for
            <span
              onClick={handleAdminClick}
              className="text-[#a855f7] hover:text-[#6366f1] cursor-pointer font-medium mx-1"
            >
              Abdullah Zabin Ali Aishan
            </span>
            <Heart className="w-4 h-4 text-red-400 mx-1" />
          </p>
          
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-gray-400">Terms of Use</Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-[#a855f7]">Admin</Link>
          </div>

          {isFreePlan && (
            <div className="mt-3 text-xs text-yellow-500/70">
              Free Plan - Contact links are for platform admin
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
