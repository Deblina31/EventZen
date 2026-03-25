import axios from "axios";

const BASE_URL = "http://localhost:3001/bookings";

export const getMyBookings = async () => {
  const token = localStorage.getItem("token");

  return await axios.get("http://localhost:3001/bookings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createBooking = async (eventId) => {
  const token = localStorage.getItem("token");

  return await axios.post(
    BASE_URL,
    { eventId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};