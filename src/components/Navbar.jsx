import React, { useState, useEffect } from "react";
import { Menu, X, Home, User, Code, Briefcase, Heart, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeveloper } from "../context/DeveloperContext";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("Home");
    const navigate = useNavigate();
    const { isFreePlan } = useDeveloper();
    
    const navItems = [
        { href: "#Home", label: "Home", icon: Home },
        { href: "#About", label: "About", icon: User },
        { href: "#Skills", label: "Skills", icon: Code },
        { href: "#Portfolio", label: "Projects", icon: Briefcase },
        { href: "#WhyMe", label: "Why Me", icon: Heart },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            
            const sections = navItems.map(item => {
                const section = document.querySelector(item.href);
                if (section) {
                    return {
                        id: item.href.replace("#", ""),
                        offset: section.offsetTop - 100,
                        height: section.offsetHeight
                    };
                }
                return null;
            }).filter(Boolean);

            const currentPosition = window.scrollY;
            const active = sections.find(section => 
                currentPosition >= section.offset && 
                currentPosition < section.offset + section.height
            );

            if (active) {
                setActiveSection(active.id);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const scrollToSection = (e, href) => {
        e.preventDefault();
        const section = document.querySelector(href);
        if (section) {
            const top = section.offsetTop - 80;
            window.scrollTo({
                top: top,
                behavior: "smooth"
            });
        }
        setIsOpen(false);
    };

    const handleLogoClick = () => {
        navigate('/u/abdullah_aishan');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav
            className={`fixed w-full top-0 z-50 transition-all duration-500 ${
                isOpen
                    ? "bg-[#030014]"
                    : scrolled
                    ? "bg-[#030014]/80 backdrop-blur-xl border-b border-white/10"
                    : "bg-transparent"
            }`}
        >
            <div className="mx-auto px-4 sm:px-6 lg:px-[10%]">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 cursor-pointer group" onClick={handleLogoClick}>
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg blur opacity-0 group-hover:opacity-70 transition duration-300"></div>
                            <div className="relative text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                                Portfolio<span className="text-white">-v5</span>
                            </div>
                        </div>
                    </div>
    
                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-1">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={(e) => scrollToSection(e, item.href)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        activeSection === item.href.substring(1)
                                            ? 'text-white bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {item.label}
                                </a>
                            ))}
                            
                            {/* Join Button */}
                            <a
                                href="#Contact"
                                onClick={(e) => scrollToSection(e, "#Contact")}
                                className="ml-4 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg text-sm font-medium hover:scale-105 transition-all"
                            >
                                Join
                            </a>
                        </div>
                    </div>
    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
    
            {/* Mobile Menu */}
            <div
                className={`md:hidden fixed inset-0 bg-[#030014] transition-all duration-300 ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-100%] pointer-events-none'
                }`}
                style={{ top: "64px" }}
            >
                <div className="flex flex-col h-full p-4">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(e) => scrollToSection(e, item.href)}
                            className={`px-4 py-3 text-lg font-medium rounded-lg ${
                                activeSection === item.href.substring(1)
                                    ? 'text-white bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20'
                                    : 'text-gray-400'
                            }`}
                        >
                            {item.label}
                        </a>
                    ))}
                    <a
                        href="#Contact"
                        onClick={(e) => scrollToSection(e, "#Contact")}
                        className="mt-4 px-4 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg text-center font-medium"
                    >
                        Join
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
