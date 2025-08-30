import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components/App";
import "./styles.css";

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
