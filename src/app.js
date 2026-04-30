// src/app.js
const BASE = import.meta.env.VITE_API_URL || "https://dsa-tracker-private.onrender.com";

const json = async (method, path, body, token) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) throw data || { message: "Request failed" };

  return data;
};

export const API = {
  // AUTH
  register: (data) => json("POST", "/api/auth/register", data),
  login:    (data) => json("POST", "/api/auth/login", data),

  // PROGRESS
  saveProgress: (payload, token) =>
    json("POST", "/api/progress", payload, token),

  loadProgress: (userId, token) =>
    json("GET", `/api/progress/${userId}`, null, token),
};

// const BASE_URL = "https://dsa-tracker-private.onrender.com";
// console.log("🔥 BASE_URL:", BASE_URL);

// export const API = {
//   register: (data) =>
//     fetch(`${BASE_URL}/api/auth/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     }).then(res => res.json()),

//   login: (data) =>
//     fetch(`${BASE_URL}/api/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     }).then(res => res.json()),

//   saveProgress: (data) =>
//     fetch(`${BASE_URL}/progress/save`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     }).then(res => res.json()),

//   loadProgress: (userId) =>
//     fetch(`${BASE_URL}/progress/${userId}`)
//       .then(res => res.json()),
// };