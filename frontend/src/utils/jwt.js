export const getToken = () => localStorage.getItem("token");

export const getPayload = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const payload = getPayload();
  if (!payload) return null;
  return payload.role || payload.roles?.[0] || null;
};

export const getUserId = () => getPayload()?.userId || null;
export const getUsername = () => getPayload()?.sub || null;

export const isTokenExpired = () => {
  const payload = getPayload();
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

export const clearToken = () => localStorage.removeItem("token");