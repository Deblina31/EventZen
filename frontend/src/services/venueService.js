import axios from "axios";
import { API } from "../constants/api";
import { getToken } from "../utils/jwt";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

export const getAllVenues = () =>
  axios.get(API.VENUES, { headers: authHeaders() });

export const getVenueById = (id) =>
  axios.get(`${API.VENUES}/${id}`, { headers: authHeaders() });

export const getMyVenues = () =>
  axios.get(`${API.VENUES}/my`, { headers: authHeaders() });

export const createVenue = (data) =>
  axios.post(API.VENUES, data, { headers: authHeaders() });

export const updateVenue = (id, data) =>
  axios.put(`${API.VENUES}/${id}`, data, { headers: authHeaders() });

export const deleteVenue = (id) =>
  axios.delete(`${API.VENUES}/${id}`, { headers: authHeaders() });

export const getVenueAvailability = (venueId) =>
  axios.get(`${API.VENUES}/${venueId}/availability`, { headers: authHeaders() });