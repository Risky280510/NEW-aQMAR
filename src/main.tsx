import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import useAuthStore from "./stores/authStore";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Initialize auth store early to check authentication state
// This ensures the auth state is loaded from localStorage before rendering
const { checkAuth } = useAuthStore.getState();
checkAuth();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
