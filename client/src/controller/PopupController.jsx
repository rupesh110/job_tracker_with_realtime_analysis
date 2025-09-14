import React, { useState, useEffect } from "react";
import App from "../display/popuppages/App.jsx";
import UsersData from "../display/popuppages/UsersData.jsx";
import { addJob } from "../Feeder/JobDataFeeder.js";
import { getPageData } from "../utils/getPageData.js";
import { isUserAvailable } from "../Feeder/UsersDataFeeder.js";

export default function PopupController() {
  const [userDataExists, setUserDataExists] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [visible, setVisible] = useState(true);
  const [showUserData, setShowUserData] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  // Load page data
  const loadData = async () => {
    const userExists = await isUserAvailable();
    setUserDataExists(userExists);

    if (userExists) {
      const scrapedData = await getPageData();
      if (scrapedData) setPageData({ ...scrapedData });
    }
  };

  // Save button handler
  const handleSave = async () => {
    if (!pageData) return;
    try {

    const { description, ...dataWithoutDescription } = pageData;
    await addJob(dataWithoutDescription);

      setNotification({ type: "success", message: "Data saved!" });
    } catch (err) {
      console.error("Failed to save data:", err);
      setNotification({ type: "error", message: "Failed to save data: " + err });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleClose = () => setVisible(false);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Detect LinkedIn URL changes (full page reload)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.location.href !== currentUrl) {
        setCurrentUrl(window.location.href);
        loadData();
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [currentUrl]);

  // Detect Seek dynamic content changes using MutationObserver
  useEffect(() => {
    if (!window.location.href.includes("seek.com.au")) return;

    const targetNode = document.body; // you can use a more specific container if needed
    const config = { childList: true, subtree: true };

    const callback = (mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.addedNodes.length > 0) {
          loadData();
          break;
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    return () => observer.disconnect();
  }, []);

  // Always show popup when new data arrives
  useEffect(() => {
    if (pageData) {
      setVisible(true);
    }
  }, [pageData]);

  if (!visible) return null;
  if (userDataExists === null) return <div>Loading...</div>;
  if (!userDataExists || showUserData) return <UsersData onClose={handleClose} />;
  if (!pageData) return <div>Processing data...</div>;

  return (
    <App
      data={pageData}
      notification={notification}
      onClose={handleClose}
      onChangeDataClick={() => setShowUserData(true)}
      onSaveButton={handleSave}
    />
  );
}
