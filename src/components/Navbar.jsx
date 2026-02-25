import React, { useState, useEffect } from "react";
import { Menu, X, Home, Briefcase, User, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("Home");
    const navigate = useNavigate();
    
    const navItems = [
        { href: "#Home", label: "Home", icon: Home },
        { href: "#About", label: "About", icon: User },
        { href: "#Portofolio", label: "Portfolio", icon: Briefcase },
        { href: "#Contact", label: "Contact", icon: Mail },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            
            // تحديث القسم النشط عند التمرير
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
        navigate('/');
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
                    {/* Logo - Portfolio-v5 */}
                    <div className="flex-shrink-0 cursor-pointer group" onClick={handleLogoClick}>
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg blur opacity-0 group-hover:opacity-70 transition duration-300"></div>
                            <div className="relative text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent hover:from-[#a855f7] hover:to-[#6366f1] transition-all duration-300">
                                Portfolio<span className="text-white">-v5</span>
                            </div>
                        </div>
                    </div>
    
                    {/* Desktop Navigation - أزرار التنقل */}
                    <div className="hidden md:block">
                        <div className="ml-8 flex items-center space-x-2">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={(e) => scrollToSection(e, item.href)}
                                    className="group relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                                >
                                    <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                                        activeSection === item.href.substring(1)
                                            ? "bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20"
                                            : "group-hover:bg-white/5"
                                    }`}></div>
                                    <div className="relative flex items-center gap-2">
                                        <item.icon className={`w-4 h-4 transition-colors duration-300 ${
                                            activeSection === item.href.substring(1)
                                                ? "text-[#a855f7]"
                                                : "text-gray-400 group-hover:text-white"
                                        }`} />
                                        <span
                                            className={`transition-colors duration-300 ${
                                                activeSection === item.href.substring(1)
                                                    ? "text-white font-semibold"
                                                    : "text-gray-400 group-hover:text-white"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`relative p-2 text-gray-400 hover:text-white transition-transform duration-300 ease-in-out transform ${
                                isOpen ? "rotate-90 scale-125" : "rotate-0 scale-100"
                            }`}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
    
            {/* Mobile Menu */}
            <div
                className={`md:hidden fixed inset-0 bg-[#030014] transition-all duration-300 ease-in-out ${
                    isOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-[-100%] pointer-events-none"
                }`}
                style={{ top: "64px" }}
            >
                <div className="flex flex-col h-full">
                    <div className="px-4 py-6 space-y-2">
                        {navItems.map((item, index) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={(e) => scrollToSection(e, item.href)}
                                className="flex items-center gap-3 px-4 py-3 text-lg font-medium rounded-xl transition-all duration-300"
                                style={{
                                    transitionDelay: `${index * 100}ms`,
                                    transform: isOpen ? "translateX(0)" : "translateX(50px)",
                                    opacity: isOpen ? 1 : 0,
                                    backgroundColor: activeSection === item.href.substring(1) 
                                        ? 'rgba(99, 102, 241, 0.1)' 
                                        : 'transparent'
                                }}
                            >
                                <item.icon className={`w-5 h-5 ${
                                    activeSection === item.href.substring(1)
                                        ? "text-[#a855f7]"
                                        : "text-gray-400"
                                }`} />
                                <span className={
                                    activeSection === item.href.substring(1)
                                        ? "text-white font-semibold"
                                        : "text-gray-400"
                                }>
                                    {item.label}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
