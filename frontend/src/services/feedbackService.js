import axios from "axios";
import { API } from "../constants/api";
import { getToken } from "../utils/jwt";

const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export const submitFeedback = (data) =>
  axios.post(API.FEEDBACK, data, { headers: authHeaders() });

export const getFeedbackByEvent = (eventId) =>
  axios.get(`${API.FEEDBACK}/event/${eventId}`, { headers: authHeaders() });

export const deleteFeedback = (id) =>
  axios.delete(`${API.FEEDBACK}/${id}`, { headers: authHeaders() });