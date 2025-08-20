import React, { useState, useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

const HideRoute = ({ children }) => {
    const location = useLocation();
    const [showNavbar, setShowNavbar] = useState(true);

    const navVisible = ["/", "/dashboard", "/quest", "/about", "/hackathons","/hackathons/:id"]

    useEffect(() => {
        if(!navVisible.includes(location.pathname)) {
            setShowNavbar(false)
        } else  {
            setShowNavbar(true)
        }
    }, [location]);

    return <div>{showNavbar && children}</div>;
};

export default HideRoute;