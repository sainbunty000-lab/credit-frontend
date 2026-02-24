import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export const wcCalculate = (data) =>
  axios.post(`${API_BASE}/wc/calculate`, data);

export const agriCalculate = (data) =>
  axios.post(`${API_BASE}/agriculture/calculate`, data);

export const bankingAnalyze = (data) =>
  axios.post(`${API_BASE}/banking/analyze`, data);
