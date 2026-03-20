// src/services/eventService.js
import axios from "axios";

const BASE_URL = "http://localhost:8081/events";

export const getAllEvents = async () => {
  const token = localStorage.getItem("token");

  return await axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};