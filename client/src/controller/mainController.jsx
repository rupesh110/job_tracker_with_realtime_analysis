import React from "react";
import ReactDOM from "react-dom/client";
import PopupController from "./PopupController.jsx";
import FloatController from "./FloatingController.jsx";
import attachClickListenersSeek from "../detect/detectApplySeek.js";
import attachClickListenersLinkedin from "../detect/detectApplyLinkedin.js";
import injectTestButtonSeek from "../display/injectButton/InjectButtonSeek.js";
import injectTestButtonsLinkedIn from "../display/injectButton/InjectButtonLinkedin.js"

export default class MainController {
  constructor() {
    this.popupContainer = null;
    this.floatContainer = null;
    this.observer = null;
  }

  init() {
    this.popupContainer = document.createElement("div");
    this.popupContainer.id = "react-extension-container";
    document.body.appendChild(this.popupContainer);
    ReactDOM.createRoot(this.popupContainer).render(<PopupController />);

    this.floatContainer = document.createElement("div");
    this.floatContainer.id = "floating-main-container";
    document.body.appendChild(this.floatContainer);
    ReactDOM.createRoot(this.floatContainer).render(<FloatController />);

    attachClickListenersSeek();
    attachClickListenersLinkedin();
    // injectTestButtonSeek();
    // injectTestButtonsLinkedIn();

    this.observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              attachClickListenersSeek(node);
              attachClickListenersLinkedin(node);
              // injectTestButtonSeek(node);
              // injectTestButtonsLinkedIn(node);
            }
          });
        }
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }
}
