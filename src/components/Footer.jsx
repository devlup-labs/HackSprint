import React, { useEffect, useRef, useState } from 'react';
import HackSprint from '/hackSprint.webp'
import { Mail, MapPin, SendIcon, Github, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';

const Footer = () => {

    const [email, setEmail] = useState('');
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const fontSize = 10;
        const columns = Math.floor(canvas.width / fontSize);
        const chars = "01".split("");
        const drops = Array(columns).fill().map(() => Math.random() * -100);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);
        const handleResize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const navSections = [
        {
            title: 'Resources',
            links: [
                { name: 'Sessions', url: 'https://www.youtube.com/@devluplabs1365' },
                { name: 'Documentation', url: 'https://full-stack-development.readthedocs.io/en/latest/' },
                { name: 'Guides', url: 'https://github.com/aaltarazi98/fullstack-guide-2025?tab=readme-ov-file' },
                { name: 'Explore Projects', url: 'https://github.com/devlup-labs/' }
            ]
        },
        {
            title: 'Quick Links',
            links: [
                { name: 'Home', url: '#' },
                { name: 'About Us', url: '#' },
                { name: 'Dev Quest', url: '#' },
                { name: 'Hackathons', url: '#' },
                { name: 'LeaderBoard', url: '#' }
            ]
        }
    ];

    const socialLinks = [
        { name: 'GitHub', icon: <Github size={20} />, url: 'https://github.com/devlup-labs/' },
        { name: 'Instagram', icon: <Instagram size={20} />, url: 'https://www.instagram.com/devluplabs/' },
        { name: 'LinkedIn', icon: <Linkedin size={20} />, url: 'https://www.linkedin.com/company/devlup-labs/' },
        { name: 'Twitter', icon: <Twitter size={20} />, url: 'https://x.com/devluplabs' },
        { name: 'Facebook', icon: <Facebook size={20} />, url: 'https://www.facebook.com/devluplabs/' }
    ];

    return (
        <footer className="relative bg-gray-900 text-gray-300 overflow-hidden">
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" />

            <div className="container mx-auto px-4 py-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 pb-12 border-b border-gray-800">
                    <div className="lg:col-span-3">
                        <div className="flex items-center mb-4">
                            <img src={HackSprint} className='h-15 ml-[-3px] mr-2 cursor-pointer' />
                            <h2 className="text-3xl font-bold text-white font-mono mt-1">
                                HackSprint
                            </h2>
                        </div>
                        <p className="text-gray-400 mb-6 text-sm">
                            From dev quests to hackathons—build skills that get noticed in placements and internships.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-start">
                                <a href="mailto:devluplabs@iitj.ac.in" target="_blank"><Mail size={16} className="text-green-500 mr-2" /></a>
                                <span className="text-sm mt-[-2px]">devluplabs@iitj.ac.in</span>
                            </div>
                            <div className="flex items-start">
                                <a href="https://www.google.com/maps/place/Indian+Institute+of+Technology+(IIT),+Jodhpur/@26.4710162,73.1085513,1026m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39418c5ea672337b:0xb6c9a5a9b08db22e!8m2!3d26.4710115!4d73.1134222!16s%2Fm%2F04ydk20?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D"><MapPin size={16} className="text-green-500 mr-2" /></a>
                                <span className="text-sm">IIT Jodhpur, Rajasthan</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-6 grid grid-cols-2  md:ml-10 lg:ml-20 md:grid-cols-2 gap-8">
                        {navSections.map((section) => (
                            <div key={section.title}>
                                <h3 className="text-white font-medium text-lg mb-4">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.links.map((items) => (
                                        <li key={items.name}>
                                            <a
                                                href={items.url}
                                                target='_blank'
                                                className="text-gray-400 hover:text-green-400 transition duration-300 text-sm block font-light"
                                            >
                                                {items.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-3">
                        <h3 className="text-white font-medium text-lg mb-3">Join our community</h3>
                            <form className="flex flex-col space-y-2">
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="participant@email.com"
                                        className="w-full bg-gray-900 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded py-2 px-3 text-gray-300 placeholder-gray-500 font-mono text-sm transition duration-300"
                                        required
                                    />
                                    <a
                                        href="https://discord.com/invite/5kKqzGdhPP"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute right-1 top-1 mt-[2px] bg-gray-800 hover:bg-gray-700 text-green-500 p-1 rounded transition duration-300 inline-flex items-center justify-center"
                                        aria-label="Subscribe"
                                    >
                                        <SendIcon size={18} />
                                    </a>

                                </div>
                                <p className="text-gray-500 text-xs">
                                    Stay updated with our latest tutorials and resources.
                                </p>
                            </form>

                        <div className="mt-8">
                            <h3 className="text-white font-medium text-lg mb-2">Connect With Us</h3>
                            <div className="flex space-x-3">
                                {socialLinks.map((items) => (
                                    <a
                                        key={items.name}
                                        href={items.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-green-400 transition"
                                    >
                                        {items.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} HackSprint. All rights reserved.
                        </p>
                    </div>
                    <div className="flex space-x-6">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((items) => (
                            <a
                                key={items}
                                className="text-xs cursor-pointer text-gray-500 hover:text-green-400 transition duration-300"
                            >
                                {items}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
