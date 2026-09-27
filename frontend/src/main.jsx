import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AppThemeProvider from "./theme/AppThemeProvider.jsx";
import ErrorBoundary from "./Components/ErrorBoundary.jsx";
import AppBootSplash from "./Components/Loading/AppBootSplash.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AppThemeProvider>
      <ErrorBoundary>
        <AppBootSplash>
          <App />
        </AppBootSplash>
      </ErrorBoundary>
    </AppThemeProvider>
  </BrowserRouter>
);

const htmlSplash = document.getElementById("mf-html-splash");
if (htmlSplash) {
  htmlSplash.remove();
}
