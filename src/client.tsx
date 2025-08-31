import ReactDOM from "react-dom/client";
import "./styles.css";
import App from "./components/App";

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
