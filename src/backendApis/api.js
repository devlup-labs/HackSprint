import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export const googleAuth = (code) =>
  API.get(`/api/authInfo?code=${code}`)

export const getDashboard = () => {
  const token = localStorage.getItem("userToken");

  return axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

