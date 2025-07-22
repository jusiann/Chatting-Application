import { create } from "zustand";
import { signIn } from "../api/auth";
import toast from "react-hot-toast";

const useUserStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    login: async (email, password) => {
        try {
            const res = await signIn({ email, password });
            set({ user: res.user });
            toast.success("Giriş başarılı!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Giriş başarısız.");
            return false;
        }
    },
    logout: () => set({ user: null }),
}));

export default useUserStore; 
