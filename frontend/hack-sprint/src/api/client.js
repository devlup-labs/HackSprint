import axios from "axios";
import { API } from "./endpoints";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const isAdminRequest = config.adminRequest || config.url?.includes("/admin");
  const token = localStorage.getItem(isAdminRequest ? "adminToken" : "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const isAdminRequest = (config) => !!(config?.adminRequest || config?.url?.includes("/admin"));
const storageKey = (admin) => (admin ? "adminToken" : "token");
const refreshUrl = (admin) => (admin ? `${API.ADMIN_AUTH}/refresh-token` : `${API.AUTH}/refresh-token`);
const isAuthEndpoint = (url) =>
  !!url && ["/refresh-token", "/login", "/google", "/logout"].some((p) => url.includes(p));

// Independent in-flight state per surface — a tab can hold both a student and
// an admin session at once, so a single global flag would wrongly queue one
// surface's 401 behind the other's refresh call.
const refreshState = {
  student: { inFlight: null },
  admin: { inFlight: null },
};

const doRefresh = async (admin) => {
  const res = await axios.post(
    `${client.defaults.baseURL}${refreshUrl(admin)}`,
    {},
    { withCredentials: true }
  );
  const newToken = res.data.token;
  localStorage.setItem(storageKey(admin), newToken);
  return newToken;
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const admin = isAdminRequest(config || {});

    if (!response || response.status !== 401 || !config || config._retry || isAuthEndpoint(config.url)) {
      if (response?.status === 401) localStorage.removeItem(storageKey(admin));
      return Promise.reject(error);
    }

    config._retry = true;
    const state = refreshState[admin ? "admin" : "student"];

    if (!state.inFlight) {
      state.inFlight = doRefresh(admin).finally(() => {
        state.inFlight = null;
      });
    }

    try {
      const newToken = await state.inFlight;
      config.headers.Authorization = `Bearer ${newToken}`;
      return client(config);
    } catch {
      localStorage.removeItem(storageKey(admin));
      return Promise.reject(error);
    }
  }
);

export default client;
