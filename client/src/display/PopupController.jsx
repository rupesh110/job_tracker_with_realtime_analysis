import React, { useState, useEffect } from "react";

import App from "./popuppages/App.jsx";
import UsersData from "./popuppages/UsersData.jsx";
import { addJob } from "../Feeder/JobDataFeeder.js";
import { getPageData } from "../utils/getPageData.js";
import { isUserAvailable } from "../Feeder/UsersDataFeeder.js";

export default function PopupController() {
  const [userDataExists, setUserDataExists] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [visible, setVisible] = useState(true);
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const [showUserData, setShowUserData] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  // Load data from page and check user
  async function loadData() {
    setPageData(null);

    const userExists = await isUserAvailable();
    setUserDataExists(userExists);

    if (userExists) {
      const scrapedData = await getPageData();
      setPageData(scrapedData);
    }

    // Reset popup visibility unless manually closed
    if (!manuallyClosed) setVisible(true);
  }

  // Handle save button click
  useEffect(() => {
    if (saveData && pageData) {
      addJob(pageData)
        .then(() => {
          setNotification({ type: "success", message: "Data saved!" });
        })
        .catch((err) => {
          console.error("Failed to save data:", err);
          setNotification({ type: "error", message: "Failed to save data: " + err });
        })
        .finally(() => {
          setSaveData(false);
          setTimeout(() => setNotification(null), 4000);
        });
    }
  }, [saveData, pageData]);

  // Initial load & watch URL changes
  useEffect(() => {
    loadData(); // initial load

    const intervalId = setInterval(() => {
      if (window.location.href !== currentUrl) {
        setCurrentUrl(window.location.href);
        loadData();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentUrl, manuallyClosed]);

  // Auto-reopen popup whenever new pageData arrives
  useEffect(() => {
    if (pageData && !visible && !manuallyClosed) {
      setVisible(true);
    }
  }, [pageData, visible, manuallyClosed]);

  const handleClose = () => {
    setVisible(false);
    setManuallyClosed(true);
  };

  if (!visible) return null;
  if (userDataExists === null) return <div>Loading...</div>;
  if (!userDataExists || showUserData) {
    return <UsersData onClose={handleClose} />;
  }
  if (!pageData) return <div>Processing data...</div>;

  return (
    <>
      <App
        data={pageData}
        onClose={handleClose}
        onChangeDataClick={() => setShowUserData(true)}
        onSaveButton={() => setSaveData(true)}
      />
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: notification.type === "success" ? "#4CAF50" : "#F44336",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
        >
          {notification.message}
        </div>
      )}
    </>
  );
}
