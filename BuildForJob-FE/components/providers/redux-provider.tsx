"use client";

import { store } from "@/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { fetchProfile } from "@/store/slices/authSlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      store.dispatch(fetchProfile());
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
