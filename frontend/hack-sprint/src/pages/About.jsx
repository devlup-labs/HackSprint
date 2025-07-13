import React, { useState, useEffect } from 'react';

const About = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState({});
    const [particles, setParticles] = useState([]);
    const [scrollY, setScrollY] = useState(0);

    // Track mouse movement for interactive effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Track scroll position for parallax effects
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(prev => ({
                        ...prev,
                        [entry.target.id]: entry.isIntersecting
                    }));
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('[id^="section-"]').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const stats = [
        { number: "10K+", label: "Active Developers", icon: "👥" },
        { number: "500+", label: "Projects Built", icon: "🚀" },
        { number: "50+", label: "Hackathons Hosted", icon: "🏆" },
        { number: "24/7", label: "Community Support", icon: "💬" }
    ];

    const features = [
        {
            title: "Our Mission",
            description: "To empower individuals to push the boundaries of technology through engaging challenges, collaborative projects, and a supportive learning environment.",
            icon: "🎯",
            color: "from-emerald-500 to-teal-600"
        },
        {
            title: "Our Vision",
            description: "To be the leading global platform for technological innovation and skill development, inspiring the next generation of creators and problem-solvers.",
            icon: "👁️",
            color: "from-gray-500 to-slate-600"
        },
        {
            title: "What We Do",
            description: "We organize hackathons, provide mentorship, foster community collaboration, and highlight groundbreaking projects that shape the future.",
            icon: "⚡",
            color: "from-emerald-600 to-gray-700"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 via-emerald-900/20 to-slate-800 text-gray-200 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating Particles */}
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className={`absolute w-1 h-1 ${particle.color} rounded-full animate-pulse`}
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            opacity: particle.opacity,
                            animation: `float ${particle.speed + 3}s ease-in-out infinite`,
                            transform: `translateY(${scrollY * 0.1}px)`
                        }}
                    />
                ))}
                
                {/* Enhanced Gradient Orbs with smoother transitions */}
                <div 
                    className="absolute w-96 h-96 bg-gradient-radial from-emerald-500/30 via-emerald-400/20 to-transparent rounded-full blur-3xl"
                    style={{
                        left: `${20 + mousePosition.x * 0.02}%`,
                        top: `${20 + mousePosition.y * 0.02}%`,
                        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: `translateY(${scrollY * 0.05}px)`
                    }}
                />
                <div 
                    className="absolute w-80 h-80 bg-gradient-radial from-gray-400/20 via-slate-500/15 to-transparent rounded-full blur-3xl"
                    style={{
                        right: `${15 + mousePosition.x * 0.015}%`,
                        top: `${40 + mousePosition.y * 0.01}%`,
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: `translateY(${scrollY * 0.03}px)`
                    }}
                />
                <div 
                    className="absolute w-72 h-72 bg-gradient-radial from-emerald-600/25 via-gray-500/15 to-transparent rounded-full blur-3xl"
                    style={{
                        left: `${60 + mousePosition.x * 0.01}%`,
                        bottom: `${20 + mousePosition.y * 0.02}%`,
                        transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: `translateY(${scrollY * 0.04}px)`
                    }}
                />
            </div>

            {/* Enhanced Interactive Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.3) 1px, transparent 0),
                        linear-gradient(rgba(156, 163, 175, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px, 50px 50px, 50px 50px',
                    transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px) translateY(${scrollY * 0.1}px)`,
                    transition: 'transform 0.3s ease-out'
                }}
            />

            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none" />

            <main className="container mx-auto px-8 py-16 relative z-10">
                {/* Hero Section */}
                <section id="section-hero" className="text-center mb-20">
                    <div className={`transition-all duration-1000 transform ${isVisible['section-hero'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[120px] ZaptronFont text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-gray-300 to-emerald-500 mb-6 animate-gradient z-10 text-center relative">
                            About HackSprint 
                        </h1>
                        {/* bg-gradient-to-r from-emerald-400 via-gray-300 to-emerald-500 mb-6 animate-gradient */}
                        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-gray-400 mx-auto mb-8 rounded-full animate-pulse" />
                        <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
                            At HackSprint, we believe in the power of innovation, collaboration, and continuous learning. 
                            We are a dynamic platform dedicated to fostering a community of developers, problem-solvers, and tech enthusiasts.
                        </p>
                        
                        {/* Enhanced Animated Code Snippet */}
                        <div className="inline-block bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 font-mono text-sm text-left max-w-md mx-auto mt-8 hover:border-emerald-500/50 transition-all duration-500 group">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                            </div>
                            <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                                <span className="text-emerald-400">function</span> <span className="text-yellow-400">innovate</span>() {'{'}
                                <br />
                                &nbsp;&nbsp;<span className="text-gray-300">return</span> <span className="text-emerald-400">"Building the future"</span>;
                                <br />
                                {'}'}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section id="section-stats" className="mb-20">
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 transform ${isVisible['section-stats'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {stats.map((stat, index) => (
                            <div 
                                key={index}
                                className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-emerald-500/10 group"
                            >
                                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-500">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300">
                                    {stat.number}
                                </div>
                                <div className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors duration-300">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section id="section-features" className="mb-20">
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 transform ${isVisible['section-features'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {features.map((feature, index) => (
                            <div        
                                key={index}
                                className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-700 transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-emerald-500/10"
                            >
                                {/* Enhanced Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />
                                
                                {/* Animated Border Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-gray-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
                                
                                {/* Content */}
                                <div className="relative z-10 p-8">
                                    <div className="text-6xl mb-6 group-hover:scale-115 transition-transform duration-500 filter group-hover:drop-shadow-lg">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action Section */}
                <section id="section-cta" className="text-center py-16 relative">
                    <div className={`transition-all duration-1000 transform ${isVisible['section-cta'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="relative bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50 overflow-hidden hover:border-emerald-500/50 transition-all duration-700 group">
                            {/* Enhanced Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-gray-500/15 to-emerald-600/20 animate-gradient-slow opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                            
                            {/* Floating Elements */}
                            <div className="absolute top-10 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                            <div className="absolute bottom-10 right-10 w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
                            
                            <div className="relative z-10">
                                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-gray-300 to-emerald-500 mb-6 animate-gradient">
                                    Join Our Journey
                                </h2>
                                <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                                    Whether you're a seasoned developer, a curious beginner, or simply passionate about technology, 
                                    there's a place for you at HackSprint. Let's build the future together.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-gray-600 text-white font-bold rounded-full text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/30 overflow-hidden">
                                        <span className="relative z-10">Get Started Today</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </button>
                                    
                                    <button className="group px-8 py-4 border-2 border-gray-600 text-gray-300 font-bold rounded-full text-lg transition-all duration-500 transform hover:scale-110 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Enhanced Custom Styles */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(180deg); }
                }
                
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes gradient-slow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes moveVertical {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-30px); }
                }
                
                @keyframes moveHorizontal {
                    0%, 100% { transform: translateX(0px); }
                    50% { transform: translateX(20px); }
                }
                
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 4s ease infinite;
                }
                
                .animate-gradient-slow {
                    background-size: 200% 200%;
                    animation: gradient-slow 8s ease infinite;
                }
                
                .bg-gradient-radial {
                    background: radial-gradient(circle, var(--tw-gradient-stops));
                }
                
                @media (max-width: 768px) {
                    .text-7xl { font-size: 3rem; }
                    .text-5xl { font-size: 2.5rem; }
                }
            `}</style>
        </div>
    );
};

export default About;