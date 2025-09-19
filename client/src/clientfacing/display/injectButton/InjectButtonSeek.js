export default function injectTestButtonsSeek(root = document) {
  const saveButtons = root.querySelectorAll('button[data-testid="jdv-savedjob"]');

  saveButtons.forEach((saveButton, index) => {
    if (saveButton.parentNode.querySelector('.ai-analysis-button')) return;

    const parent = saveButton.parentNode;

    // Make parent a horizontal flex container
    parent.style.display = 'flex';
    parent.style.alignItems = 'center';
    parent.style.gap = '8px'; // spacing between buttons

    // Helper to create button
    const createButton = (text, className, bgColor) => {
      const btn = saveButton.cloneNode(true);
      btn.classList.add(className);
      btn.dataset.listenerAdded = 'false';
      btn.removeAttribute('data-testid');

      const textSpan = btn.querySelector('div._1pb1ad54w._1pb1ad551');
      if (textSpan) textSpan.textContent = text;

      btn.style.backgroundColor = bgColor;
      btn.style.color = '#fff';

      const newBtn = btn.cloneNode(true);
      newBtn.addEventListener('click', () => {
        alert(`${text} clicked for job #${index + 1}`);
      });

      return newBtn;
    };

    // Create both buttons
    const aiAnalysisBtn = createButton('AI_Analysis', 'ai-analysis-button', '#0073b1');
    const coverLetterBtn = createButton('Generate_Cover_Letter', 'cover-letter-button', '#ff6600');

    // Append after Save button
    parent.appendChild(aiAnalysisBtn);
    parent.appendChild(coverLetterBtn);
  });
}
