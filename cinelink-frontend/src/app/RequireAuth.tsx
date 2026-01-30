import { Navigate, Outlet } from "react-router-dom";
import { authStorage } from "@/services/auth.storage";

export default function RequireAuth() {
    const token = authStorage.get();
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}
