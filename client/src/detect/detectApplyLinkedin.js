import { addJob } from '../Feeder/JobDataFeeder.js';
import { extractLinkedInData } from '../extract/extractLinkedin.js';

export default function attachClickListenersLinkedin(root = document) {
  // Select only top-card Apply buttons
  const applyButtons = root.querySelectorAll('button.jobs-apply-button');

  applyButtons.forEach((btn, index) => {
    if (btn.dataset.listenerAdded) return;
    btn.dataset.listenerAdded = "true";

    btn.addEventListener('click', e => {
      const textSpan = btn.querySelector('.artdeco-button__text');
      if (!textSpan || textSpan.textContent.trim().toLowerCase() !== 'apply') return;

      e.stopPropagation();
      console.log("LinkedIn Top-Card Apply clicked:", btn);

      // Wait for modal content using MutationObserver
      const observer = new MutationObserver(async (mutations, obs) => {
        const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title');
        if (titleEl) {
          obs.disconnect();

          try {
            const data = await extractLinkedInData();
            if (data && data.title && data.title !== 'N/A') {
              await addJob(data);
              console.log("Job saved:", data);
            } else {
              console.warn("No job data found in modal — skipping save.");
            }
          } catch (err) {
            console.error("Error extracting or saving job:", err);
          }

          alert(`LinkedIn Apply clicked for job #${index + 1}`);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  });

  // Recursively handle shadow DOM
  root.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) attachClickListenersLinkedin(el.shadowRoot);
  });
}
