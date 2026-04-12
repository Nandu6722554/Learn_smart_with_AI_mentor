import axios from "axios";

const BASE = "http://localhost:5000/api";

export const fetchLearn = (topic, level) => axios.post(`${BASE}/learn`, { topic, level });
export const fetchQuiz = (topic, level) => axios.post(`${BASE}/quiz`, { topic, level });
export const fetchPlayground = (topic, level) => axios.post(`${BASE}/playground`, { topic, level });
export const fetchELI10 = (topic) => axios.post(`${BASE}/eli10`, { topic });
export const fetchRevision = (topic) => axios.post(`${BASE}/revision`, { topic });
export const fetchDoubt = (topic, question) => axios.post(`${BASE}/doubt`, { topic, question });
