import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // 🔑 sends cart_guest_token cookie
  headers: { "Content-Type": "application/json" },
});
