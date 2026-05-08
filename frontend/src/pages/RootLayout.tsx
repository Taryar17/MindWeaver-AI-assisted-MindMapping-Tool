import { Outlet } from "react-router-dom";

import Sidebar from "@/components/layouts/Sidebar";
import TopNavbar from "@/components/layouts/TopNavbar";
import Footer from "@/components/layouts/Footer";

function RootLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <TopNavbar />

        <main className="flex-1 p-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default RootLayout;
