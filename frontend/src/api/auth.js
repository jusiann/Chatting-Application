import axios from "./axios";

export const signUp = async (formData) => {
    return await axios.post("/auth/sign-up", formData).then(res => res.data);
};

export const signIn = async (formData) => {
    const res = await axios.post("/auth/sign-in", formData);
    return res.data;
}; 

export const checkAuth = async () => {
    const res = await axios.get("/auth/check");
    return res.data;
}