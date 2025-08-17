import React, { useState, useEffect } from 'react';

const About = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState({});
    const [scrollY, setScrollY] = useState(0);

    // Track mouse movement
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer
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


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-200 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute w-96 h-96 bg-gradient-radial from-emerald-500/20 via-emerald-400/10 to-transparent rounded-full blur-3xl"
                    style={{
                        left: `${30 + mousePosition.x * 0.01}%`,
                        top: `${20 + mousePosition.y * 0.01}%`,
                        transition: 'all 0.8s ease-out',
                        transform: `translateY(${scrollY * 0.05}px)`
                    }}
                />
                <div 
                    className="absolute w-80 h-80 bg-gradient-radial from-gray-400/15 via-slate-500/10 to-transparent rounded-full blur-3xl"
                    style={{
                        right: `${20 + mousePosition.x * 0.008}%`,
                        bottom: `${30 + mousePosition.y * 0.008}%`,
                        transition: 'all 1s ease-out',
                        transform: `translateY(${scrollY * 0.03}px)`
                    }}
                />
            </div>

            {/* Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    transform: `translate(${mousePosition.x * 0.002}px, ${mousePosition.y * 0.002}px)`
                }}
            />

            <main className="container mx-auto px-6 py-20 relative z-10">
                {/* Hero Section */}
                <section id="section-hero" className="text-center mb-32">
                    <div className={`transition-all duration-1000 ${isVisible['section-hero'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[120px] ZaptronFont text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-gray-300 to-emerald-500 mb-6 animate-gradient z-10 text-center relative">
                            About HackSprint
                        </h1>
                        
                        <div className="max-w-4xl mx-auto space-y-8">
                            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                                We're building the future of tech education through hands-on experiences, 
                                collaborative learning, and real-world problem solving.
                            </p>
                            
                            <div className="inline-block bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30 font-mono text-sm hover:border-emerald-500/30 transition-all duration-300">
                                <span className="text-emerald-400">const</span> <span className="text-yellow-400">mission</span> = <span className="text-blue-400">"Empower through code"</span>;
                            </div>
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section id="section-story" className="mb-32">
                    <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible['section-story'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                               <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl ZaptronFont text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-gray-300 to-emerald-500 mb-6 animate-gradient z-10 text-center relative">
                                    Our Story
                                </h2>
                                <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                                    <p>
                                        HackSprint started as a simple idea: what if learning to code could be as 
                                        engaging as playing a game? We wanted to create a space where developers 
                                        at any level could challenge themselves, learn new skills, and build 
                                        something meaningful.
                                    </p>
                                    <p>
                                        Today, we're a community of innovators, problem-solvers, and dreamers who 
                                        believe that the best way to learn is by doing. Through hackathons, workshops, 
                                        and collaborative projects, we're shaping the next generation of tech leaders.
                                    </p>
                                </div>
                                
                                <div className="flex gap-4 mt-8">
                                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105">
                                        Join Community
                                    </button>
                                    <button className="px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-emerald-400 hover:text-emerald-400 transition-all duration-300">
                                        Our Projects
                                    </button>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                    </div>
                                    
                                    <div className="mt-8 space-y-3 font-mono text-sm">
                                        <div><span className="text-purple-400">class</span> <span className="text-yellow-400">HackSprint</span> {`{`}</div>
                                        <div className="ml-4"><span className="text-emerald-400">mission</span>: <span className="text-blue-300">"Innovation through collaboration"</span></div>
                                        <div className="ml-4"><span className="text-emerald-400">focus</span>: [<span className="text-blue-300">"learning"</span>, <span className="text-blue-300">"building"</span>, <span className="text-blue-300">"growing"</span>]</div>
                                        <div className="ml-4">
                                            <span className="text-purple-400">async</span> <span className="text-yellow-400">empowerDevelopers</span>() {`{`}
                                            <div className="ml-4"><span className="text-gray-400">// Creating the future, one line at a time</span></div>
                                            <div className="ml-4"><span className="text-purple-400">return</span> <span className="text-blue-300">"endless possibilities"</span>;</div>
                                            <div>{`}`}</div>
                                        </div>
                                        <div>{`}`}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section id="section-values" className="mb-32">
                    <div className={`transition-all duration-1000 ${isVisible['section-values'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                       <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl ZaptronFont text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-gray-300 to-emerald-500 mb-6 animate-gradient z-10 text-center relative">
                            What Drives Us
                        </h2>
                        
                        <div className="max-w-5xl mx-auto space-y-12">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center group">
                                    
                                    <h3 className="text-xl font-bold text-white mb-3">Innovation</h3>
                                    <p className="text-gray-400">Pushing boundaries and exploring new possibilities in technology</p>
                                </div>
                                
                                <div className="text-center group">
                                    
                                    <h3 className="text-xl font-bold text-white mb-3">Collaboration</h3>
                                    <p className="text-gray-400">Building together creates stronger solutions and lasting connections</p>
                                </div>
                                
                                <div className="text-center group">
                                    
                                    <h3 className="text-xl font-bold text-white mb-3">Learning</h3>
                                    <p className="text-gray-400">Every challenge is an opportunity to grow and improve</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Helping Organizations Section */}
                <section id="section-help" className="mb-32">
                    <div className={`max-w-6xl mx-auto grid md:grid-cols-4 gap-10 items-start transition-all duration-1000 ${isVisible['section-help'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {/* Left Side */}
                        <div className="md:col-span-1">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Helping organizations get ahead of the competition
                            </h2>
                            <p className="text-gray-400 text-lg">
                                Here’s how we help corporations and governments get to the next 
                                level with our platform, your one-stop innovation space.
                            </p>
                        </div>
                        {/* Right Side - Cards */}
                        <div className="md:col-span-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="p-6 bg-emerald-900/20 rounded-2xl shadow-lg border border-gray-700/30 hover:border-emerald-400/40 transition-all duration-300">
                                
                                <h3 className="text-xl font-semibold text-white mb-2">Innovate faster</h3>
                                <p className="text-gray-400">Identify innovative solutions for your organizational challenges.</p>
                            </div>
                            <div className="p-6 bg-emerald-900/20 rounded-2xl shadow-lg border border-gray-700/30 hover:border-emerald-400/40 transition-all duration-300">
                                
                                <h3 className="text-xl font-semibold text-white mb-2">Attract and recruit</h3>
                                <p className="text-gray-400">Test and recruit the best talent based on their hard and soft skills. Elevate your brand.</p>
                            </div>
                            <div className="p-6 bg-emerald-900/20 rounded-2xl shadow-lg border border-gray-700/30 hover:border-emerald-400/40 transition-all duration-300">
      
                                <h3 className="text-xl font-semibold text-white mb-2">Accelerate your transformation</h3>
                                <p className="text-gray-400">Develop agility and structural transformation within your organization.</p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* CTA Section */}
                <section id="section-cta" className="text-center">
                    <div className={`transition-all duration-1000 ${isVisible['section-cta'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl ZaptronFont text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-gray-300 to-emerald-500 mb-6 animate-gradient z-10 text-center relative">
                                Ready to Sprint?
                            </h2>

                            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                                Join thousands of developers who are already building the future. 
                                Your next breakthrough is just one hack away.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25">
                                    Start Building
                                </button>
                                <button className="px-8 py-4 border-2 border-gray-600 text-gray-300 font-bold rounded-xl text-lg hover:border-emerald-400 hover:text-emerald-400 transition-all duration-300">
                                    Explore Events
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <style jsx>{`
                .bg-gradient-radial {
                    background: radial-gradient(circle, var(--tw-gradient-stops));
                }
            `}</style>
        </div>
    );
};

export default About;