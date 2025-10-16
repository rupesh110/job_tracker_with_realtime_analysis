import React, { useState, useEffect, useRef } from "react";
import App from "../clientfacing/display/popuppages/App.jsx";
import UsersData from "../clientfacing/display/popuppages/UsersData.jsx";
import { addJob } from "../clientfacing/Feeder/JobDataFeeder.js";
import { getPageData } from "../clientfacing/utils/getPageData.js";
import { isUserAvailable } from "../clientfacing/Feeder/UsersDataFeeder.js";
import { getCoverLetter } from "../clientfacing/Feeder/GeminiJobFeeder.js";

export default function PopupController() {
  const [userDataExists, setUserDataExists] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [visible, setVisible] = useState(true);
  const [showUserData, setShowUserData] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  const ongoingUserCheck = useRef(false);

  const loadData = async () => {
    if (ongoingUserCheck.current) return;
    ongoingUserCheck.current = true;

    try {
      const userExists = await isUserAvailable();
      setUserDataExists(userExists);

      if (userExists) {
        const scrapedData = await getPageData();
        if (scrapedData) setPageData({ ...scrapedData });
      }
    } catch (err) {
      console.error("loadData error:", err);
    } finally {
      ongoingUserCheck.current = false;
    }
  };

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

  // Detect Seek dynamic content changes with debounce
  useEffect(() => {
    if (!window.location.href.includes("seek.com.au")) return;

    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    let debounceTimeout = null;

    const callback = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(loadData, 100);
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    return () => observer.disconnect();
  }, []);

  // Port connection to background
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "feeder-port" });

    port.onMessage.addListener((msg) => {
      if (msg.action === "Client_UpdateText" && msg.data) {
        setPageData(msg.data);
        setVisible(true);
        port.postMessage({ action: "Client_DataReceived", dataId: msg.data?.id || null });
      }
    });

    return () => port.disconnect();
  }, []);

  // Always show popup when new data arrives
  useEffect(() => {
    if (pageData) setVisible(true);
  }, [pageData]);

  const handleSave = async () => {
    if (!pageData) return;
    try {
      const { description, ...dataWithoutDescription } = pageData;
      await addJob(dataWithoutDescription);
      setNotification({ type: "success", message: "Data saved!" });
    } catch (err) {
      setNotification({ type: "error", message: "Failed to save data: " + err });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleCoverLetter = async () => {
    if (!pageData) return;

    try {
      const coverLetterResponse = await getCoverLetter(pageData);
      const rawText = coverLetterResponse;

      if (!rawText) {
        setNotification({ type: "error", message: "No cover letter data received from Gemini." });
        return;
      }

      setNotification({ type: "success", message: "Cover letter generated" });
      setTimeout(() => setNotification(null), 6000);
    } catch (err) {
      setNotification({ type: "error", message: "Failed to generate cover letter." });
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handleClose = () => setVisible(false);

  // Render logic
  if (!visible) return null;
  if (userDataExists === null) return <div>Loading...</div>;
  if (!userDataExists || showUserData) return <UsersData onClose={handleClose} />;
  if (!pageData) return <div>Processing data...</div>;

  // Only render App if title is not "N/A"
  if (pageData.title === "N/A") return <div>No valid job data available.</div>;

  return (
    <App
      data={pageData}
      notification={notification}
      onClose={handleClose}
      onChangeDataClick={() => setShowUserData(true)}
      onSaveButton={handleSave}
      onGenerateCoverLetter={handleCoverLetter}
    />
  );
}
