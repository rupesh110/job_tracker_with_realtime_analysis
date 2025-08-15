import React from "react";
import ReactDOM from "react-dom/client";
import PopupController from "./display/PopupController.jsx";
import FloatController from "./display/floatingController.jsx";

const container = document.createElement("div");
container.id = "react-extension-container";
document.body.appendChild(container);

const root = ReactDOM.createRoot(container);
root.render(<PopupController />);

const floatingContainer = document.createElement("div");
floatingContainer.id = "floating-main-container";
document.body.appendChild(floatingContainer);

const floatingRoot = ReactDOM.createRoot(floatingContainer);
floatingRoot.render(<FloatController />);