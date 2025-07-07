import React, { useEffect, useState } from 'react';
import { getDashboard } from '../backendApis/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) navigate('/login'); // Fallback in case route isn't wrapped
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboard();
        setData(res.data);
      } catch (err) {
        console.error('❌ Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div
      style={{
        padding: '2rem',
        paddingTop: '6rem', // Offset for fixed navbar
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: '#0a0e17',
        color: 'white',
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#00ff9f',
          marginBottom: '2rem',
        }}
      >
        👤 User Dashboard
      </h1>

      {loading && <p style={{ fontSize: '1.2rem' }}>Loading...</p>}

      {!loading && data && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1d2233',
              padding: '1rem 2rem',
              borderRadius: '16px',
              border: '2px solid #00ff9f',
              marginBottom: '2rem',
              boxShadow: '0px 0px 10px #00ff9f66',
            }}
          >
            <img
              src={
                data.avatar_url ||
                'https://avatars.githubusercontent.com/u/583231?v=4'
              }
              alt="avatar"
              style={{
                borderRadius: '50%',
                width: '100px',
                marginRight: '1.5rem',
                border: '2px solid white',
              }}
            />
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {data.nickname || 'Unnamed User'}
              </h2>
              <p>🐙 {data.github_id || 'unknown.github'}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                marginLeft: 'auto',
                padding: '0.5rem 1rem',
                backgroundColor: '#ff3c3c',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = '#e02929')
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = '#ff3c3c')
              }
            >
              Logout
            </button>
          </div>

          <div
            style={{
              backgroundColor: '#1d2233',
              borderRadius: '16px',
              padding: '1rem',
              border: '2px solid #00ff9f',
              boxShadow: '0px 0px 10px #00ff9f66',
            }}
          >
            <h3
              style={{
                fontSize: '1.3rem',
                color: '#00ff9f',
                marginBottom: '1rem',
                fontWeight: 'bold',
              }}
            >
              📦 SUBMITTED HACKATHONS
            </h3>

            {Array.isArray(data.submissions) &&
            data.submissions.length > 0 ? (
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
                        padding: '12px',
                        backgroundColor: '#111820',
                        color: '#00ff9f',
                        textAlign: 'left',
                      }}
                    >
                      Hackathon
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        backgroundColor: '#111820',
                        color: '#00ff9f',
                        textAlign: 'left',
                      }}
                    >
                      Problem Statement
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        backgroundColor: '#111820',
                        color: '#00ff9f',
                        textAlign: 'left',
                      }}
                    >
                      Time of Submission
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.submissions.map((entry, idx) => (
                    <tr key={idx}>
                      <td
                        style={{
                          padding: '12px',
                          borderBottom: '1px solid #333',
                        }}
                      >
                        {entry.title}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          borderBottom: '1px solid #333',
                        }}
                      >
                        {entry.problem_statement}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          borderBottom: '1px solid #333',
                        }}
                      >
                        {new Date(entry.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#aaa', padding: '1rem' }}>
                📦 No submissions found.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
