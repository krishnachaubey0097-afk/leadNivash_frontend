import axios from 'axios';
import { env } from '../env';

// Independent Axios client dedicated exclusively to refreshing tokens
// MUST NOT have response interceptors to prevent infinite refresh recursion
export const refreshClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
