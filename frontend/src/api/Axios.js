import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // backend portun neyse "http://localhost:5001/api    --"/api" olmalı"
  withCredentials: true,
});

export default axiosInstance;
