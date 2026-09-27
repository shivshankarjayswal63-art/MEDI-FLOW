import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AppThemeProvider from "./theme/AppThemeProvider.jsx";
import ErrorBoundary from "./Components/ErrorBoundary.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AppThemeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AppThemeProvider>
  </BrowserRouter>
);
