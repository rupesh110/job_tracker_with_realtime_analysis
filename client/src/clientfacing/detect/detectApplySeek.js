import { addJob } from '../Feeder/JobDataFeeder.js';
import { extractLinkedInData } from '../extract/extractLinkedin.js';

export default function attachClickListenersSeek(root = document) {
  root.querySelectorAll('a, button').forEach(el => {
    if (!el.dataset.listenerAdded) {
      el.dataset.listenerAdded = "true";
      el.addEventListener('click', e => {
        const text = e.currentTarget.textContent.toLowerCase();
        if (text.includes("Quick apply")) {
          e.stopPropagation();
          //

          // Poll for modal content
          const startTime = Date.now();
          const maxWait = 5000; // 5 seconds max
          const interval = setInterval(async () => {
            const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title');
            if (titleEl) {
              clearInterval(interval); 

              try {
                const data = await extractLinkedInData();
                if (data && data.title && data.title !== 'N/A') {
                  await addJob(data);
                  //
                } else {
                  console.warn("No job data found — skipping save.");
                }
              } catch (err) {
                console.error("Error extracting or saving job:", err);
              }

              alert("LinkedIn Apply clicked!");
            } else if (Date.now() - startTime > maxWait) {
              clearInterval(interval);
              console.warn("Modal never loaded, skipping extraction.");
            }
          }, 100); // check every 100ms
        }
      });
    }
  });

  // Recursively handle shadow DOM
  root.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) attachClickListenersLinkedin(el.shadowRoot);
  });
}
