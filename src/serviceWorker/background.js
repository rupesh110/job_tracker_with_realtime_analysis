chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background:", request);
  // or
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Background Message',
    message: 'Message received in background script!',
  });
});
