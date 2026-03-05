import React, { useState, useEffect } from "react";
import { Menu, X, Home, User, Code, Briefcase, Heart, Crown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeveloper } from "../context/DeveloperContext";
import ContactSupport from "./ContactSupport";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("Home");
    const [showContact, setShowContact] = useState(false);
    
    const navigate = useNavigate();
    const { username } = useParams();
    const { developer, isFreePlan } = useDeveloper();
    
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ✅ دالة تنسيق اسم المستخدم بألوان متدرجة
    const formatUsername = (name) => {
        if (!name) return '';
        
        // إذا كان الاسم طويلاً جداً، نختصره
        if (name.length > 20) {
            return name.substring(0, 17) + '...';
        }
        return name;
    };

    // ✅ عرض الشعار حسب الحالة
    const renderLogo = () => {
        const isDeveloperPage = !!username;
        const isPaidDeveloper = developer && !isFreePlan();

        // إذا كنا في صفحة مطور والمطور مدفوع
        if (isDeveloperPage && isPaidDeveloper) {
            return (
                <span className="bg-gradient-to-r from-[#6366f1] via-purple-400 to-[#a855f7] bg-clip-text text-transparent">
                    {formatUsername(username)}
                </span>
            );
        }

        // في جميع الحالات الأخرى، شعار المنصة العادي
        return (
            <span className="bg-gradient-to-r from-[#6366f1] via-purple-400 to-[#a855f7] bg-clip-text text-transparent">
                Portfolio-v5
            </span>
        );
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
                    {/* Logo - بنفس التدرج اللوني في كل الحالات */}
                    <div className="flex-shrink-0 cursor-pointer group" onClick={handleLogoClick}>
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg blur opacity-0 group-hover:opacity-70 transition duration-300"></div>
                            <div className="relative text-xl font-bold">
                                {renderLogo()}
                                
                                {/* أيقونة التاج للمدفوع */}
                                {developer && !isFreePlan() && (
                                    <Crown className="inline-block w-4 h-4 ml-1 text-yellow-400" />
                                )}
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

                            {/* أيقونة التواصل للباقة المجانية */}
                            {developer && isFreePlan() && (
                                <button
                                    onClick={() => setShowContact(true)}
                                    className="ml-2 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all relative group"
                                    title="طرق التواصل"
                                >
                                    <svg 
                                        className="w-5 h-5" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2"
                                    >
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                    </svg>
                                    
                                    {/* نقطة حمراء */}
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                            )}
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
                    
                    {/* زر التواصل في الجوال للباقة المجانية */}
                    {developer && isFreePlan() && (
                        <button
                            onClick={() => {
                                setShowContact(true);
                                setIsOpen(false);
                            }}
                            className="mt-2 px-4 py-3 bg-white/5 text-gray-300 rounded-lg text-center font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            <span>طرق التواصل</span>
                        </button>
                    )}
                    
                    <a
                        href="#Contact"
                        onClick={(e) => scrollToSection(e, "#Contact")}
                        className="mt-2 px-4 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg text-center font-medium"
                    >
                        Join
                    </a>
                </div>
            </div>

            {/* نافذة التواصل */}
            {showContact && (
                <div className="fixed inset-0 z-[100]">
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowContact(false)}
                    />
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
                        <ContactSupport />
                        
                        <button
                            onClick={() => setShowContact(false)}
                            className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
