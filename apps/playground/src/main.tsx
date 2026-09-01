import React from "react";
import ReactDOM from "react-dom/client";
import "@pageflip/theme";
import { App } from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(<App />);
