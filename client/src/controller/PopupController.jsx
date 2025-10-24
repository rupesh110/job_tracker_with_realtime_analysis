import React, { useState, useEffect, useRef } from "react";
import App from "../clientfacing/display/popuppages/App.jsx";
import UsersData from "../clientfacing/display/popuppages/UsersData.jsx";
import { addJob } from "../clientfacing/Feeder/JobDataFeeder.js";
import { getPageData } from "../clientfacing/utils/getPageData.js";
import { isUserDataAvailable } from "../clientfacing/Feeder/UsersDataFeeder.js";
import { getCoverLetter } from "../clientfacing/Feeder/GeminiJobFeeder.js";

export default function PopupController() {
  const [userDataExists, setUserDataExists] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [visible, setVisible] = useState(true);
  const [showUserData, setShowUserData] = useState(false);
  const [notification, setNotification] = useState(null);

  const ongoingUserCheck = useRef(false);
  const prevUrlRef = useRef(window.location.href);


  // 🔍 Load user + page data (centralized)
  const loadData = async () => {
    if (ongoingUserCheck.current) return;
    ongoingUserCheck.current = true;

    try {
      const userExists = await isUserDataAvailable();
      console.log("User data exists:", userExists);
      setUserDataExists(userExists);

      if (userExists) {
        const scrapedData = await getPageData();
        if (scrapedData) setPageData(scrapedData);
      } else {
        setPageData(null);
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

  // 🔁 Detect URL change only once per navigation
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== prevUrlRef.current) {
        prevUrlRef.current = currentUrl;
        loadData();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // 🔎 Optional Seek dynamic detection (debounced)
  useEffect(() => {
    if (!window.location.href.includes("seek.com.au")) return;

    const observer = new MutationObserver(() => {
      clearTimeout(observer.debounce);
      observer.debounce = setTimeout(loadData, 200);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // 🛰️ Background Port Connection
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "feeder-port" });

    port.onMessage.addListener((msg) => {
      if (msg.action === "Client_UpdateText" && msg.data) {
        setPageData(msg.data);
        setVisible(true);
        port.postMessage({
          action: "Client_DataReceived",
          dataId: msg.data?.id || null,
        });
      }
    });

    return () => port.disconnect();
  }, []);

  // 💾 Save job to backend
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

  // 🧠 Generate cover letter
  const handleCoverLetter = async () => {
    if (!pageData) return;
    try {
      const response = await getCoverLetter(pageData);
      if (!response) {
        setNotification({
          type: "error",
          message: "No cover letter data received from Gemini.",
        });
        return;
      }
      setNotification({ type: "success", message: "Cover letter generated" });
      setTimeout(() => setNotification(null), 6000);
    } catch {
      setNotification({
        type: "error",
        message: "Failed to generate cover letter.",
      });
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handleClose = () => setVisible(false);

  // ✅ After user saves new info
  const handleUserDataSaved = async () => {
    setShowUserData(false);
    await loadData(); // refresh state after saving
  };

  // ---------------- Render Logic ----------------
  if (!visible) return null;
  if (userDataExists === null) return <div>Loading...</div>;

  if (!userDataExists || showUserData) {
    return <UsersData onClose={handleClose} onDataSaved={handleUserDataSaved} />;
  }

  if (!pageData) return <div>Processing data...</div>;
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
