import { Outlet, useMatches } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PanelHelmet from "./PanelHelmet";
import { Toaster } from "sonner";

export default function AppLayout() {
  const matches = useMatches();
  // Pick the deepest match that has a handle.title
  const title = [...matches].reverse().find((m) => m.handle?.title)?.handle?.title ?? "Panel";

  return (
    <>
      <PanelHelmet title={title} />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header title={title} />
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </>
  );
}
