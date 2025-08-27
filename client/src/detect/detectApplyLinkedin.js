import { addJob } from '../Feeder/JobDataFeeder.js';
import { extractLinkedInData } from '../extract/extractLinkedin.js';

/**
 * Attach click listeners to LinkedIn Apply buttons.
 * Extracts job data once the modal is loaded.
 */
export default function attachClickListenersLinkedin(root = document) {
  root.querySelectorAll('a, button').forEach(el => {
    if (!el.dataset.listenerAdded) {
      el.dataset.listenerAdded = "true";
      el.addEventListener('click', e => {
        const text = e.currentTarget.textContent.toLowerCase();
        if (text.includes("apply")) {
          e.stopPropagation();
          console.log("LinkedIn Apply clicked:", e.currentTarget);

          // Use MutationObserver to wait for modal content
          const observer = new MutationObserver(async (mutations, obs) => {
            const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title');
            if (titleEl) {
              obs.disconnect(); // Stop observing

              try {
                const data = await extractLinkedInData();
                if (data && Object.keys(data).length > 0 && data.title !== 'N/A') {
                  await addJob(data);
                  console.log("Job saved:", data);
                } else {
                  console.warn("No job data found in modal — skipping save.");
                }
              } catch (err) {
                console.error("Error extracting or saving job:", err);
              }

              alert("LinkedIn Apply clicked!");
            }
          });

          // Start observing the DOM for modal content
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
    }
  });

  // Recursively handle shadow DOM
  root.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) attachClickListenersLinkedin(el.shadowRoot);
  });
}

/**
 * Optional: Automatic page scan for jobs, only if elements exist.
 */
export async function autoScanLinkedInJobs() {
  const jobElements = document.querySelectorAll('.jobs-search-results__list-item');
  if (!jobElements || jobElements.length === 0) return; // Skip if no jobs

  for (const jobEl of jobElements) {
    try {
      const data = await extractLinkedInData();
      if (data && data.title !== 'N/A') {
        await addJob(data);
        console.log("Auto-saved job:", data.title);
      }
    } catch (err) {
      console.error("Auto-scan failed:", err);
    }
  }
}
