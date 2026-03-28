import axios from "axios";
import { API } from "../constants/api";
import { getToken } from "../utils/jwt";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

export const getAllEvents = () =>
  axios.get(API.EVENTS, { headers: authHeaders() });

export const getEventById = (id) =>
  axios.get(`${API.EVENTS}/${id}`, { headers: authHeaders() });

export const getEventsByCategory = (category) =>
  axios.get(`${API.EVENTS}/category/${category}`, { headers: authHeaders() });

export const getMyEvents = () =>
  axios.get(`${API.EVENTS}/my-events`, { headers: authHeaders() },
console.log("Token being sent to Event Service:", localStorage.getItem('token'))
);

export const createEvent = (data) =>
  axios.post(API.EVENTS, data, { headers: authHeaders() });

export const updateEvent = (id, data) =>
  axios.put(`${API.EVENTS}/${id}`, data, { headers: authHeaders() });

export const deleteEvent = (id) =>
  axios.delete(`${API.EVENTS}/${id}`, { headers: authHeaders() });

export const addExpense = (id, amount) =>
  axios.patch(`${API.EVENTS}/${id}/expenses`, { amount }, { headers: authHeaders() });


export const recordTicketSale = (id, amount, ticketType) =>
  axios.patch(`${API.EVENTS}/${id}/ticket-sale`,
    { amount, ticketType },
    { headers: authHeaders() }
  );