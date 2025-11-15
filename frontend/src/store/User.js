import { create } from "zustand";
import { checkAuth, signIn, logout as apiLogout, signUp } from "../api/Auth";
import toast from "react-hot-toast";

const useUserStore = create((set,get) => ({
  user: null,
  loggingIn: false,
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    set({ loggingIn: true });
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await signIn({ email, password });
      set({ user: res.user });
      if (res.access_token || res.refresh_token) {
        localStorage.setItem("access_token", res.access_token);
        localStorage.setItem("refresh_token", res.refresh_token);
        console.log("Token kaydedildi:", res.access_token);
      }
      toast.success("Giriş başarılı!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Giriş başarısız.");
      return false;
    } finally {
      set({ loggingIn: false });
    }
  },
  signUp: async (payload) => {
    set({ loggingIn: true });
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await signUp(payload);
      return res;
    } catch (error) {
      toast.error(error.response?.data?.message || "Kayıt başarısız.");
      return false;
    } finally {
      set({ loggingIn: false });
    }
  },
  logout: async () => {
    try {
      await apiLogout(get().user.id);
    } catch {}
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } catch {}
    try {
      const socketStore = require("./Socket").default;
      socketStore.getState().disconnect();
    } catch {}
    set({ user: null });
  },
  checkAuth: async () => {
    const res = await checkAuth();
    set({ user: res.user });
    localStorage.setItem("access_token", res.access_token);
  },
}));

export default useUserStore;
