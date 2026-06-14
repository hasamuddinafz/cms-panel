import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useAppSelector } from "./app/hooks";
import { selectTheme } from "./features/theme/themeSlice";
import { router } from "./app/router";

function ThemeApplier() {
  const mode = useAppSelector(selectTheme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
  return null;
}

export default function App() {
  return (
    <>
      <ThemeApplier />
      <RouterProvider router={router} />
    </>
  );
}
