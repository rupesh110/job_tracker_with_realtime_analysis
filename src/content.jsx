import React from "react";
import ReactDOM from "react-dom/client";
import MainController from "./display/MainController.jsx";

const container = document.createElement("div");
container.id = "react-extension-container";
document.body.appendChild(container);

const root = ReactDOM.createRoot(container);
root.render(<MainController />);
