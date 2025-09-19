import React, { useState, useEffect } from "react";
import App from "../clientfacing/display/popuppages/App.jsx";
import UsersData from "../clientfacing/display/popuppages/UsersData.jsx";
import { addJob } from "../clientfacing/Feeder/JobDataFeeder.js";
import { getPageData } from "../clientfacing/utils/getPageData.js";

import { isUserAvailable } from "../clientfacing/Feeder/UsersDataFeeder.js";
import { getCoverLetter} from "../clientfacing/Feeder/GeminiJobFeeder.js"
import { generateCoverLetterPDF} from "../clientfacing/service/convertTextToPdf.js"
import { generateCoverLetterDoc } from "../clientfacing/service/convertToDocs.js"

export default function PopupController() {
  const [userDataExists, setUserDataExists] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [visible, setVisible] = useState(true);
  const [showUserData, setShowUserData] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);


  useEffect(() => {
    // Real-time updates
    const listener = (msg) => {
      if (msg.action === "Client_UpdateText" && msg.data) {
        console.log("Popup received real-time data:", msg.data);
        setPageData(msg.data);
      }
    };
    chrome.runtime.onMessage.addListener(listener);

    // Polling in case popup opens before data arrives
    const intervalId = setInterval(() => {
      chrome.runtime.sendMessage({ action: "Request_LatestData" }, (res) => {
        if (res?.data) {
          console.log("Popup got latest data via polling:", res.data);
          setPageData(res.data);
          clearInterval(intervalId);
        }
      });
    }, 500); // check every 0.5s

    // Stop polling after 15s
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 15000);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);



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


  const handleCoverLetter = async () => {
    if (!pageData) return;

    try {
      // 1️⃣ Send pageData to Gemini and get full text
      const coverLetterResponse = await getCoverLetter(pageData);

      // 2️⃣ Extract raw text (Gemini output)
      const rawText = coverLetterResponse; // assuming getCoverLetter returns full text string
      console.log("Full Gemini output:", rawText);

      if (!rawText) {
        setNotification({
          type: "error",
          message: "No cover letter data received from Gemini.",
        });
        return;
      }

      // 3️⃣ Generate PDF directly from raw text
      //generateCoverLetterPDF(rawText);
      generateCoverLetterDoc(rawText)

      // 4️⃣ Notify user
      setNotification({
        type: "success",
        message: "Cover letter generated and downloaded!",
      });
      setTimeout(() => setNotification(null), 6000);

    } catch (err) {
      console.error("Error generating cover letter:", err);
      setNotification({
        type: "error",
        message: "Failed to generate cover letter.",
      });
      setTimeout(() => setNotification(null), 6000);
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
      onGenerateCoverLetter={handleCoverLetter}
    />
  );
}
