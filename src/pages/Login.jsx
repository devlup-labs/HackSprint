import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleAuth } from '../backendApis/api';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const responseGoogle = async (authResult) => {
    try {
      setLoading(true);
      if (authResult['code']) {
        const result = await googleAuth(authResult['code']);
        const { name, email } = result.data.user;
        const token = result.data.token;

        localStorage.setItem("userToken", token);
        localStorage.setItem("userEmail", email);

        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: 'auth-code',
  });

  const githubAuthLogin = () => {
    window.location.assign(
      "https://github.com/login/oauth/authorize?client_id=" +
        import.meta.env.VITE_GITHUB_CLIENT_ID
    );
  };

  return (
    <div className='min-h-screen flex justify-center items-center bg-gray-900'>
      {loading ? (
        <p className="text-white">Logging in...</p>
      ) : (
        <div className='flex flex-col gap-5 items-center'>
          <button
            onClick={googleLogin}
            className='text-white border-2 border-green-800 px-4 py-2 rounded-xl cursor-pointer'
          >
            Google Login
          </button>
          <p className='text-white'>------Or-------</p>
          <button
            onClick={githubAuthLogin}
            className='text-white border-2 border-green-800 px-4 py-2 rounded-xl cursor-pointer'
          >
            Github Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
