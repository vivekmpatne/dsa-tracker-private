//const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = "https://dsa-tracker-private.onrender.com"; // HARD CODED URL FOR TESTING
console.log("🔥 BASE_URL:", BASE_URL);   // ADD THIS

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

  // ✅ FIXED
  saveProgress: (data) =>
    fetch(`${BASE_URL}/api/progress/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  // ✅ FIXED
  loadProgress: (userId) =>
    fetch(`${BASE_URL}/api/progress/${userId}`)
      .then(res => res.json()),
};
