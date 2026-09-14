import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import axios from "axios";

// Configure global axios interceptor for dual authentication
axios.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin_token");
  const playerToken = localStorage.getItem("player_token");
  const token = adminToken || playerToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.withCredentials = true;
  return config;
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
