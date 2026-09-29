import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "production" ? "/api" : "http://localhost:3001/api",
    withCredentials: true
})