import axios from "axios";
import { API } from "../constants/api";
import { getToken } from "../utils/jwt";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

export const getMyBookings = () =>
  axios.get(API.BOOKING, { headers: authHeaders() });

export const getBookingById = (id) =>
  axios.get(`${API.BOOKING}/${id}`, { headers: authHeaders() });

export const createBooking = (data) =>
  axios.post(API.BOOKING, data, { headers: authHeaders() });

export const cancelBooking = (id) =>
  axios.delete(`${API.BOOKING}/${id}`, { headers: authHeaders() });

export const getAllBookings = () =>
  axios.get(API.BOOKING, { headers: authHeaders() });