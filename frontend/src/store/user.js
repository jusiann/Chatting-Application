import { create } from "zustand";
import { checkAuth, signIn } from "../api/auth";
import toast from "react-hot-toast";

const useUserStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    login: async (email, password) => {
        try {
            const res = await signIn({ email, password });
            set({ user: res.user });
            if (res.access_token || res.refresh_token) {
                localStorage.setItem('access_token', res.access_token);
                localStorage.setItem('refresh_token', res.refresh_token);
                console.log('Token kaydedildi:', res.access_token);
            }
            toast.success("Giriş başarılı!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Giriş başarısız.");
            return false;
        }
    },
    logout: () => set({ user: null }),
    checkAuth: async () => {
        const res = await checkAuth();
        set({ user: res.user });
        localStorage.setItem('access_token', res.access_token);
    }
}));

export default useUserStore; 
