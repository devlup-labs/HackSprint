import axios from 'axios'
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export const googleAuth = (code) => API.get(`/api/account/google?code=${code}`) // API.get(`/api/authInfo?code=${code}`)

export const getDashboard = () => {
  const token = localStorage.getItem("token");

  return axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/userData`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const activeHackathons = ()=>{
    return axios.get('http://localhost:3000/api/hackathons/')
    .then((result) => {
        // console.log("data from DB = ",result.data.allHackathons);
        console.log("data from DB = ",result);
        // return result.data.allHackathons
        return result.data;

    }).catch((err) => {
        console.log(err);
    });
}

export const expiredHackathons = ()=>{
    return axios.get('http://localhost:3000/api/hackathons/expiredHackathons')
    .then((result)=>{
        console.log("data from DB = ",result);
        return result;
    })
    .catch((error)=>{
        console.log(error);
    })
}
