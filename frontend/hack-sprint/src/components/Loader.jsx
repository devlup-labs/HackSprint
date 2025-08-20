import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Loader = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [opacity, setOpacity] = useState(1);
    const location = useLocation()

    useEffect(() => {
        setIsLoading(true)
        setOpacity(1)

        setTimeout(() => {
            setOpacity(0);
        }, 1000);

        setTimeout(() => {
            setIsLoading(false);
        }, 2000);

    }, [location])

    if (!isLoading) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-900 z-10000 flex items-center justify-center"
            style={{
                transition: 'opacity 1s ease-in-out',
                opacity: opacity
            }}
        >
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-green-500/20 rounded-full blur-[100px] animate-pulse" />
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-gray-900
 bg-[size:50px_50px] opacity-20"/>
            <div className="relative">
                <div className="relative w-48 h-48">
                    <img
                        src="/hackSprint.webp"
                        className="w-full h-full object-contain animate-float"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' }}
                    />

                    <div className="absolute inset-[-10px] border-2 border-green-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-[-20px] border-2 border-green-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                </div>

                <div className="absolute bottom-[-3rem] left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-[bounce_1.5s_infinite_0ms] opacity-80"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-[bounce_1.5s_infinite_300ms] opacity-80"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-[bounce_1.5s_infinite_600ms] opacity-80"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loader;