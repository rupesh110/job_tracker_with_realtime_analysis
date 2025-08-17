import React from "react";
import ReactDOM from "react-dom/client";
import PopupController from "./display/PopupController.jsx";
import FloatController from "./display/floatingController.jsx";
import attachClickListeners from "./detect/detectClicks.js"

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

attachClickListeners();


const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // element node
          attachClickListeners(node);
        }
      });
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });