import axios from "axios";

export const api = axios.create({
  baseURL: "https://inventory-backend-71mk.onrender.com",
});