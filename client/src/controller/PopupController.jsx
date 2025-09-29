import React, { useState, useEffect, useRef } from "react";
import App from "../clientfacing/display/popuppages/App.jsx";
import UsersData from "../clientfacing/display/popuppages/UsersData.jsx";
import { addJob } from "../clientfacing/Feeder/JobDataFeeder.js";
import { getPageData } from "../clientfacing/utils/getPageData.js";
import { isUserAvailable } from "../clientfacing/Feeder/UsersDataFeeder.js";
import { getCoverLetter } from "../clientfacing/Feeder/GeminiJobFeeder.js";
import { generateCoverLetterPDF } from "../clientfacing/service/convertTextToPdf.js";

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

  // ✅ Initial load
  useEffect(() => {
    loadData();
  }, []);

  // ✅ Detect LinkedIn URL changes (full page reload)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.location.href !== currentUrl) {
        setCurrentUrl(window.location.href);
        loadData();
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [currentUrl]);

  // ✅ Detect Seek dynamic content changes with debounce
  useEffect(() => {
    if (!window.location.href.includes("seek.com.au")) return;

    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    let debounceTimeout = null;

    const callback = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(loadData, 100); // debounce rapid DOM changes
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    return () => observer.disconnect();
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
      console.error("Failed to save data:", err);
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

      generateCoverLetterPDF(rawText);
      setNotification({ type: "success", message: "Cover letter generated and downloaded!" });
      setTimeout(() => setNotification(null), 6000);
    } catch (err) {
      console.error("Error generating cover letter:", err);
      setNotification({ type: "error", message: "Failed to generate cover letter." });
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handleClose = () => setVisible(false);

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
      onGenerateCoverLetter={handleCoverLetter}
    />
  );
}
