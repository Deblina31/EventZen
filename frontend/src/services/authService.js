import axios from "axios";
import { API } from "../constants/api";

export const loginUser = (form) =>
  axios.post(`${API.AUTH}/login`, form);

export const registerUser = (form) =>
  axios.post(`${API.AUTH}/register`, form);