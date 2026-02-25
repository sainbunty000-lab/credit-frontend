import axios from "axios";

const API_BASE = "https://YOUR-RAILWAY-BACKEND-URL";

export const wcCalculate = (data) =>
  axios.post(`${API_BASE}/wc/calculate`, data);

export const agriCalculate = (data) =>
  axios.post(`${API_BASE}/agriculture/calculate`, data);

export const bankingAnalyze = (data) =>
  axios.post(`${API_BASE}/banking/analyze`, data);

export const bankingUpload = (formData) =>
  axios.post(`${API_BASE}/banking/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
