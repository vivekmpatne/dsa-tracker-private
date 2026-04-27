const BASE_URL = "http://localhost:5000";

export const API = {
  register: (data) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  login: (data) =>
    fetch(`${BASE_URL}/auth/login`, {
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