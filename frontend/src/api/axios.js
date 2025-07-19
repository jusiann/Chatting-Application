import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // backend portun neyse
  withCredentials: true,
});

export default axiosInstance;
