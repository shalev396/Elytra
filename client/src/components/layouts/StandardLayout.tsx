import { Outlet } from "react-router-dom";
import NavBar from "@/components/shared/NavBar";
import Footer from "@/components/shared/Footer";

export function StandardLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
