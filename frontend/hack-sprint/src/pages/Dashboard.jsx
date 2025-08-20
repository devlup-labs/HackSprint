import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Dashboard = () => {

  const [data, setData] = useState({
    nickname: 'User_Name', // Dummy data
    github_id: 'example_id.github', // Dummy data
    avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', // Dummy data (GitHub logo)
    submissions: [
      {
        title: 'Hackathon of Code',
        problem_statement: 'Problem Statement of Hackathon',
        submitted_at: new Date().toString(),
      },
      {
        title: 'Hackathon 1',
        problem_statement: 'Build an AI assistant.',
        submitted_at: new Date().toString(),
      },
      {
        title: 'Hackathon 2',
        problem_statement: 'Create a weather app.',
        submitted_at: new Date().toString(),
      },
    ],
  });

  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logout successfull...", { autoClose: 1000 })
    setTimeout(() => {
      navigate('/');
    }, 1700)
  };

  return (
    <div
      style={{
        padding: '2rem',
        paddingTop: '6rem',

        minHeight: '100vh',
        backgroundColor: '#0a0e17',
        color: 'white',
        fontFamily: "'Courier New', Courier, monospace", // General monospace font
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

      }}
    >
      {/* Header (as seen in the image) - Ideally a separate component */}
      {/* <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          backgroundColor: '#1a1d29',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #00ff9f',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://hacksprint.com/logo.png" // Placeholder, replace with actual logo if available
            alt="HACKSPRINT Logo"
            style={{ width: '40px', marginRight: '10px' }}
          />
          <span
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white',
              fontFamily: "'Press Start 2P', cursive", // Keeping pixelated for HACKSPRINT title
            }}
          >
            HACKSPRINT
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '1.1rem' }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
            HOME PAGE
          </a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
            ABOUT US
          </a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
            QUESTS
          </a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
            DASHBOARD
          </a>
        </div>
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#cccccc',
            border: '2px solid white',
          }}
        ></div>
      </div> */}

      <div
        style={{
          width: 'clamp(300px, 90%, 900px)',
          marginTop: '2rem',
        }}
      >
        {/* User Info Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start', // Align items to the start to properly position Nickname below avatar
            backgroundColor: '#1d2233',
            padding: '1.5rem 2.5rem',
            borderRadius: '16px',
            border: '2px solid #00ff9f',
            marginBottom: '2rem',
            boxShadow: '0px 0px 15px #00ff9f66',
            position: 'relative',
          }}
        >
          {/* Avatar and Nickname Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start', // Align contents to the start
              marginRight: '2rem',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '120px', // Same size as image
                height: '120px',
                borderRadius: '12px',
                border: '3px solid #00ff9f',
                overflow: 'hidden', // Ensure image stays within bounds
                marginBottom: '10px', // Space between avatar and "Nickname"
              }}
            >
              <img
                src={data.avatar_url} // Uses the dummy avatar_url
                alt="avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '9px', // Slightly smaller border radius for inner image
                }}
              />


            </div>
            <span
              style={{
                fontSize: '1.2rem',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Nickname
            </span>
          </div>

          <div style={{ flexGrow: 1 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>
              {data.nickname} {/* Uses the dummy nickname */}
            </h2>
            <p style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem' }}>
              <span style={{ marginRight: '8px' }}>
                {/* GitHub Icon SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387 0.599 0.111 0.793-0.261 0.793-0.577v-2.234c-3.338 0.726-4.033-1.416-4.033-1.416-0.546-1.387-1.333-1.756-1.333-1.756-1.087-0.744 0.084-0.729 0.084-0.729 1.205 0.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.493 0.998 0.108-0.776 0.418-1.305 0.762-1.604-2.665-0.305-5.467-1.334-5.467-5.931 0-1.311 0.469-2.381 1.236-3.221-0.124-0.305-0.535-1.524 0.118-3.176 0 0 1.008-0.322 3.301 1.23 0.957-0.266 1.983-0.399 3.003-0.399 1.02 0 2.047 0.133 3.004 0.399 2.294-1.552 3.302-1.23 3.302-1.23 0.653 1.653 0.242 2.871 0.118 3.176 0.77 0.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921 0.43 0.372 0.823 1.102 0.823 2.222v3.293c0 0.319 0.192 0.694 0.801 0.576 4.765-1.589 8.196-6.085 8.196-11.389 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </span>
              {data.github_id} {/* Uses the dummy github_id */}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              marginLeft: 'auto',
              padding: '0.8rem 1.8rem',
              backgroundColor: '#ff3c3c',
              border: '2px solid #e02929',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'background 0.3s ease, transform 0.1s ease',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.4)',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e02929';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ff3c3c';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Logout
          </button>
        </div>


        {/* Submitted Hackathons Section */}
        <div
          style={{
            backgroundColor: '#1d2233',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '2px solid #00ff9f',
            boxShadow: '0px 0px 15px #00ff9f66',
          }}
        >
          <h3
            className='ZaptronFont text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-800 tracking-widest z-10 text-center relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'
          >
            SUBMITTED HACKATHONS
            {/* Inner div for blur/glow effect */}

          </h3>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: 'white',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: '15px',
                    backgroundColor: '#111820',
                    color: '#00ff9f',
                    textAlign: 'left',
                    border: '1px solid #00ff9f',
                  }}
                >
                  Hackathon
                </th>
                <th
                  style={{
                    padding: '15px',
                    backgroundColor: '#111820',
                    color: '#00ff9f',
                    textAlign: 'left',
                    border: '1px solid #00ff9f',
                  }}
                >
                  Problem Statement
                </th>
                <th
                  style={{
                    padding: '15px',
                    backgroundColor: '#111820',
                    color: '#00ff9f',
                    textAlign: 'left',
                    border: '1px solid #00ff9f',
                  }}
                >
                  Time of Submission
                </th>
              </tr>
            </thead>
            <tbody>
              {data.submissions.map((entry, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#2a3042' : '#1d2233',
                  }}
                >
                  <td
                    style={{
                      padding: '12px',
                      border: '1px solid #333',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span

                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#00ff9f',
                        marginRight: '10px',
                        flexShrink: 0,
                      }}
                    ></span>
                    {entry.title}
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      border: '1px solid #333',
                    }}
                  >
                    {entry.problem_statement}
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      border: '1px solid #333',
                    }}
                  >
                    {new Date(entry.submitted_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;