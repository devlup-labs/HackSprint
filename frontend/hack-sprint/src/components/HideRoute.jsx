import React, { useState, useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

const HideRoute = ({ children }) => {
    const location = useLocation();
    const [showNavbar, setShowNavbar] = useState(true);

    const navVisible = ["/", "/dashboard", "/quest", "/about", "/expiredhackathons"];

    useEffect(() => {
        // Check static paths
        let visible = navVisible.includes(location.pathname);
        // Check dynamic paths
        if (!visible) {
            // Check for /hackathon/:id and /hackathons/:id
            const matchHackathon = matchPath("/hackathon/:id", location.pathname);
            const matchHackathons = matchPath("/hackathons/:id", location.pathname);
            visible = matchHackathon !== null || matchHackathons !== null;
        }

        setShowNavbar(visible);
    }, [location]);

    return <div>{showNavbar && children}</div>;
};

export default HideRoute;