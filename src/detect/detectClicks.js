export default function attachClickListeners(root = document) {
  root.querySelectorAll('a, button').forEach(el => {
    if (!el.dataset.listenerAdded) {
      el.dataset.listenerAdded = "true";
      el.addEventListener('click', e => {
        // Only trigger for this element, not inner spans
        const text = e.currentTarget.textContent.toLowerCase();
        if (text.includes("apply")) {
          e.stopPropagation();
          alert("Click detected! Yes too");
          console.log("Clicked element:", e.currentTarget);
        }
      });
    }
  });

  // Recursively check shadow roots
  root.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) attachClickListeners(el.shadowRoot);
  });
}
