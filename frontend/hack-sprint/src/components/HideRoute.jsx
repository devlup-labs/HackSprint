import React, { useState, useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

const HideRoute = ({ children }) => {
    const location = useLocation();
    const [showNavbar, setShowNavbar] = useState(true);

    const navVisible = ["/", "/login", "/about", "/quest"];

    useEffect(() => {
        // console.log(location);
        const isDynamicRoute = matchPath({ path: "/item/:id", exact: true }, location.pathname);
        if (!navVisible.includes(location.pathname) && !isDynamicRoute) {
            setShowNavbar(false);
        } else {
            setShowNavbar(true);
        }
    }, [location, navVisible]);

    return <div>{showNavbar && children}</div>;
};

export default HideRoute;