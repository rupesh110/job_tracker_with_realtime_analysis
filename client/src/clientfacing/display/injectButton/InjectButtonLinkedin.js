export default function injectTestButtonsLinkedIn(root = document) {
  const saveButtons = root.querySelectorAll('button.jobs-save-button');

  saveButtons.forEach((saveButton, index) => {
    if (saveButton.parentNode.querySelector('.ai-analysis-button')) return;

    const parent = saveButton.parentNode;

    // Make parent a horizontal flex container
    parent.style.display = 'flex';
    parent.style.alignItems = 'center';
    parent.style.gap = '8px';

    // Helper to create a new button
    const createButton = (text, className, bgColor) => {
      const btn = saveButton.cloneNode(true);
      btn.classList.add(className);
      btn.dataset.listenerAdded = 'false';

      // Change text
      const textSpan = btn.querySelector('span.jobs-save-button__text');
      if (textSpan) textSpan.textContent = text;

      // Colors
      btn.style.backgroundColor = bgColor;
      btn.style.color = '#fff';

      // Remove old event listeners
      const newBtn = btn.cloneNode(true);
      newBtn.addEventListener('click', () => {
        alert(`${text} clicked for job #${index + 1}`);
      });

      return newBtn;
    };

    const aiAnalysisBtn = createButton('AI_Analysis', 'ai-analysis-button', '#0b8bd4ff');
    const coverLetterBtn = createButton('Generate_Cover_Letter', 'cover-letter-button', '#0b8bd4ff');

    // Append after Save button
    parent.appendChild(aiAnalysisBtn);
    parent.appendChild(coverLetterBtn);
  });
}
