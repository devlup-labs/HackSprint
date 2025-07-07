import React, { useState, useEffect } from 'react'

const NotFound = () => {
    const [particles, setParticles] = useState([]);
    const [glitchActive, setGlitchActive] = useState(false);

    // Generate random particles
    useEffect(() => {
        const generateParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 15; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 3 + 1,
                    color: ['#0FC448', '#D62B2B', '#FFF', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 5)],
                    duration: Math.random() * 4 + 4,
                    delay: Math.random() * 2
                });
            }
            setParticles(newParticles);
        };

        generateParticles();
        
        // Trigger glitch effect periodically
        const glitchInterval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 200);
        }, 3000);

        return () => clearInterval(glitchInterval);
    }, []);

    const handleReturnHome = () => {
        window.location.href = "/";
    };

    return (
        <div style={{ 
            width: "100vw", 
            height: "100vh", 
            background: "linear-gradient(135deg, #060A21 0%, #0A0F2A 50%, #1A0E2E 100%)", 
            position: "relative", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            overflow: "hidden", 
            padding: "20px", 
            boxSizing: "border-box" 
        }}>
            {/* Animated grid background */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundImage: `
                    linear-gradient(rgba(15, 196, 72, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(15, 196, 72, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
                opacity: "0.3",
                animation: "gridMove 20s linear infinite"
            }} />

            {/* Pulsing circles */}
            <div style={{
                position: "absolute",
                top: "20%",
                left: "15%",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                border: "2px solid rgba(15, 196, 72, 0.2)",
                animation: "pulse 4s ease-in-out infinite"
            }} />
            <div style={{
                position: "absolute",
                bottom: "20%",
                right: "15%",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                border: "2px solid rgba(214, 43, 43, 0.2)",
                animation: "pulse 3s ease-in-out infinite reverse"
            }} />

            {/* ERROR Title with glitch effect */}
            <h1 className={`text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[180px] ZaptronFont text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-red-800 tracking-widest z-10 text-center ${glitchActive ? 'glitch' : ''}`}
                style={{ 
                    // fontFamily: "'Impact', 'Arial Black', sans-serif",
                    textShadow: glitchActive ? "2px 0 #ff00ff, -2px 0 #00ffff" : "none",
                    animation: glitchActive ? "glitch 0.2s ease-in-out" : "none"
                }}>
                ERROR
            </h1>

            {/* Main 404 Content Container */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "30px", marginBottom: "40px", flexWrap: "wrap" }}>
                {/* First 4 */}
                <div style={{ 
                    color: "#FFF", 
                    textAlign: "center", 
                    fontFamily: "'Impact', 'Arial Black', sans-serif", 
                    fontSize: "clamp(120px, 15vw, 200px)", 
                    fontWeight: "400", 
                    lineHeight: "1.2", 
                    minWidth: "100px", 
                    textShadow: "0 0 30px rgba(255, 255, 255, 0.2), 0 0 60px rgba(15, 196, 72, 0.3)",
                    animation: "textGlow 3s ease-in-out infinite alternate"
                }}>
                    4
                </div>

                {/* Skull and DEAD CODE Container */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "120px", position: "relative" }}>
                    {/* Rotating ring around skull */}
                    <div style={{
                        position: "absolute",
                        width: "clamp(140px, 20vw, 220px)",
                        height: "clamp(140px, 20vw, 220px)",
                        border: "2px solid rgba(214, 43, 43, 0.3)",
                        borderRadius: "50%",
                        animation: "rotate 10s linear infinite"
                    }} />
                    
                    {/* Skull placeholder - you can replace with your skull.png */}
                    <div style={{ 
                        width: "clamp(120px, 18vw, 200px)", 
                        height: "clamp(120px, 18vw, 200px)", 
                        marginBottom: "15px", 
                        filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.1)) drop-shadow(0 0 30px rgba(214, 43, 43, 0.3))",
                        background: "radial-gradient(circle, rgba(214, 43, 43, 0.1) 0%, transparent 70%)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "clamp(60px, 8vw, 100px)",
                        animation: "float 6s ease-in-out infinite"
                    }}>
                        💀
                    </div>
                </div>

                {/* Second 4 */}
                <div style={{ 
                    color: "#FFF", 
                    textAlign: "center", 
                    fontFamily: "'Impact', 'Arial Black', sans-serif", 
                    fontSize: "clamp(120px, 15vw, 200px)", 
                    fontWeight: "400", 
                    lineHeight: "1.2", 
                    minWidth: "100px", 
                    textShadow: "0 0 30px rgba(255, 255, 255, 0.2), 0 0 60px rgba(15, 196, 72, 0.3)",
                    animation: "textGlow 3s ease-in-out infinite alternate"
                }}>
                    4
                </div>
            </div>

            {/* Sorry message with typewriter effect */}
            <div style={{ 
                color: "#FFF", 
                textAlign: "center", 
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
                fontSize: "clamp(14px, 2.5vw, 22px)", 
                fontWeight: "400", 
                lineHeight: "1.4", 
                marginBottom: "50px", 
                maxWidth: "90%", 
                opacity: "0.9",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "15px 25px",
                borderRadius: "10px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
                Sorry, the page you requested could not be found.
            </div>

            {/* Return Home Button with enhanced effects */}
            <button 
                onClick={handleReturnHome} 
                style={{ 
                    width: "clamp(160px, 25vw, 220px)", 
                    height: "clamp(40px, 5vw, 55px)", 
                    borderRadius: "28px", 
                    border: "2px solid #0FC448", 
                    background: "rgba(15, 196, 72, 0.1)", 
                    color: "#FFF", 
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
                    fontSize: "clamp(14px, 2vw, 18px)", 
                    fontWeight: "600", 
                    letterSpacing: "1px", 
                    cursor: "pointer", 
                    transition: "all 0.3s ease", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    backdropFilter: "blur(10px)", 
                    boxShadow: "0 4px 20px rgba(15, 196, 72, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    position: "relative",
                    overflow: "hidden"
                }} 
                onMouseEnter={(e) => { 
                    e.currentTarget.style.background = "rgba(15, 196, 72, 0.2)"; 
                    e.currentTarget.style.borderColor = "#12d954"; 
                    e.currentTarget.style.transform = "translateY(-2px)"; 
                    e.currentTarget.style.boxShadow = "0 6px 25px rgba(15, 196, 72, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"; 
                }} 
                onMouseLeave={(e) => { 
                    e.currentTarget.style.background = "rgba(15, 196, 72, 0.1)"; 
                    e.currentTarget.style.borderColor = "#0FC448"; 
                    e.currentTarget.style.transform = "translateY(0)"; 
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(15, 196, 72, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"; 
                }}>
                {/* Button shine effect */}
                <div style={{
                    position: "absolute",
                    top: "-2px",
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                    animation: "shine 3s ease-in-out infinite"
                }} />
                Return Home
            </button>

            {/* Dynamic floating particles */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    style={{
                        position: "absolute",
                        top: `${particle.y}%`,
                        left: `${particle.x}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        background: particle.color,
                        borderRadius: "50%",
                        opacity: "0.6",
                        animation: `float ${particle.duration}s ease-in-out infinite`,
                        animationDelay: `${particle.delay}s`
                    }}
                />
            ))}

            {/* CSS animations */}
            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 0.3; }
                        50% { transform: scale(1.1); opacity: 0.6; }
                    }
                    
                    @keyframes rotate {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes textGlow {
                        0% { text-shadow: 0 0 30px rgba(255, 255, 255, 0.2), 0 0 60px rgba(15, 196, 72, 0.3); }
                        100% { text-shadow: 0 0 40px rgba(255, 255, 255, 0.4), 0 0 80px rgba(15, 196, 72, 0.5); }
                    }
                    
                    @keyframes gridMove {
                        0% { transform: translate(0, 0); }
                        100% { transform: translate(50px, 50px); }
                    }
                    
                    @keyframes shine {
                        0% { left: -100%; }
                        100% { left: 100%; }
                    }
                    
                    @keyframes glitch {
                        0% { transform: translateX(0); }
                        20% { transform: translateX(-2px); }
                        40% { transform: translateX(2px); }
                        60% { transform: translateX(-2px); }
                        80% { transform: translateX(2px); }
                        100% { transform: translateX(0); }
                    }
                    
                    @media (max-width: 768px) {
                        body {
                            overflow-x: hidden;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .main-container {
                            gap: 20px;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default NotFound;