import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader'; // Make sure this path is correct

// Main component for the Expired Hackathons page
function ExpiredHackathons() {
  // State to hold the list of expired hackathons
  const [expHackathon, setExpHackathon] = useState([]);
  // State for potential errors
  const [error, setError] = useState(null);
  // State to manage the loading screen
  const [isLoading, setIsLoading] = useState(true);

  // Dummy data array to simulate a list of expired hackathons
  const dummyExpiredHackathons = [
    { id: 1, title: "Web Dev Challenge 2023", description: "Build a responsive website.", endDate: "2023-10-15T23:59:59Z" },
    { id: 2, title: "Mobile App Hackathon", description: "Create an innovative mobile app.", endDate: "2024-03-20T18:00:00Z" },
    { id: 3, title: "AI/ML Innovations", description: "Develop a machine learning model.", endDate: "2024-07-01T12:00:00Z" },
    { id: 4, title: "Game Jam 2024", description: "Design and develop a game in 48 hours.", endDate: "2024-09-05T23:59:59Z" },
  ];

  // useEffect hook to simulate fetching data and control the loader
  useEffect(() => {
    // Show the loader for 2 seconds, then show the content
    const timer = setTimeout(() => {
      setExpHackathon(dummyExpiredHackathons);
      setError(null);
      setIsLoading(false); // Hide loader and show page
    }, 2000); 

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only once on mount

  // While loading, display the full-screen loader component
  if (isLoading) {
    return <Loader />;
  }

  // After loading, render the actual page content
  return (
    // CRITICAL FIX: Added '-mt-16' to pull the page up behind the navbar
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-6 -mt-16">
      
      {/* CRITICAL FIX: Added 'pt-32' to push the content down below the navbar */}
      <div className="w-full pt-32">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl ZaptronFont text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800 text-center mb-12 relative">
          Expired Hackathons
        </h1>

        <div className='w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden'>
          {error && <p className="text-red-500 text-lg mb-4 text-center p-2">{error}</p>}
          
          {expHackathon.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {expHackathon.map((hackathon) => (
                  <tr key={hackathon.id}>
                    <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-white">{hackathon.title}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-400">{new Date(hackathon.endDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !error && <p className="text-gray-400 text-lg text-center p-4">No expired hackathons found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpiredHackathons;