import axios from 'axios';
import { env } from '../env';

// Independent Axios client dedicated exclusively to refreshing tokens
// MUST NOT have response interceptors to prevent infinite refresh recursion.
// Timeout set to 45s to withstand backend cold-starts without dropping the user's session.
export const refreshClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});
