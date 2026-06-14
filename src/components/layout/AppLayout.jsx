import { Outlet, useMatches } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PanelHelmet from "./PanelHelmet";
import { Toaster } from "sonner";
import ErrorBoundary from "../ErrorBoundary";

export default function AppLayout() {
  const matches = useMatches();
  const title = [...matches].reverse().find((m) => m.handle?.title)?.handle?.title ?? "Panel";

  return (
    <>
      <PanelHelmet title={title} />
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header title={title} />
          <main className="flex-1 p-6 overflow-y-auto">
            <ErrorBoundary key={title}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "rounded-xl border shadow-md text-sm",
          },
        }}
      />
    </>
  );
}
