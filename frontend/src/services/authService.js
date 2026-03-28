import axios from "axios";
import { API } from "../constants/api";
import { getToken } from "../utils/jwt";

const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export const loginUser    = (form) => axios.post(`${API.AUTH}/login`,    form);
export const registerUser = (form) => axios.post(`${API.AUTH}/register`, form);

export const getProfile = () =>
  axios.get(API.PROFILE, { headers: authHeaders() });

export const uploadProfilePicture = (file) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post(`${API.PROFILE}/picture`, form, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" }
  });
};