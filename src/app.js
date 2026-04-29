const BASE_URL = "https://dsa-tracker-private.onrender.com";
console.log("🔥 BASE_URL:", BASE_URL);

export const API = {
  register: (data) =>
    fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  login: (data) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  saveProgress: (data) =>
    fetch(`${BASE_URL}/progress/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  loadProgress: (userId) =>
    fetch(`${BASE_URL}/progress/${userId}`)
      .then(res => res.json()),
};