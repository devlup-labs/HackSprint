import React, { useState, useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

const HideRoute = ({ children }) => {
    const location = useLocation();
    const [showNavbar, setShowNavbar] = useState(true);

    useEffect(() => {
        const pathsToHideNavbar = []; // Mention the paths where the navbar should be hidden

        let hideCurrentPath = false;
        for (const pathToHide of pathsToHideNavbar) {
            if (matchPath({ path: pathToHide, exact: true }, location.pathname)) {
                hideCurrentPath = true;
                break;
            }
        }
        setShowNavbar(!hideCurrentPath);

    }, [location]);

    return <div>{showNavbar && children}</div>;
};

export default HideRoute;