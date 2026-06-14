import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import "./i18n";
import App from "./App";
import { store } from "./app/store";
import ErrorBoundary from "./components/ErrorBoundary";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <ErrorBoundary>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </ErrorBoundary>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
