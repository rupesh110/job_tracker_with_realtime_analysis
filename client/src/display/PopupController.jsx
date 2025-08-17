import React, { useState, useEffect } from "react";

import App from "./popuppages/App.jsx";
import UsersData from "./popuppages/UsersData.jsx";


import { getPageData } from "../utils/getPageData.js";
import { isUserDataAvailable } from "../utils/getUserData.js";
import { setJobData } from "../data/jobConfig.js";


export default function PopupController() {
  const [userDataExists, setUserDataExists] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [visible, setVisible] = useState(true);
  const [showUserData, setShowUserData] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [notification, setNotification] = useState(null);


  async function loadData() {
    setPageData(null);
    const userExists = await isUserDataAvailable();
    setUserDataExists(userExists);

    if (userExists) {
      const scrapedData = await getPageData((geminiResult) => {
        setPageData((prev) => ({ ...prev, gemini: geminiResult }));
      });
      setPageData(scrapedData);
    }

    setVisible(true);
  }

  useEffect(() => {
    if (saveData && pageData) {
      setJobData(pageData)
        .then((response) => {
          console.log("Spreadsheet save success:", response);
          setNotification({ type: "success", message: "Data saved to your spreadsheet!" });
        })
        .catch((error) => {
          console.error("Spreadsheet save failed:", error);
          setNotification({ type: "error", message: "Failed to save data: " + error });
        })
        .finally(() => {
          setSaveData(false); // reset flag
          setTimeout(() => setNotification(null), 4000); // auto-hide after 4s
        });
    }
  }, [saveData, pageData]);



  useEffect(() => {
    loadData();
    let currentUrl = window.location.href;
    const intervalId = setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log("URL changed, refetching data...");
        setVisible(false);
        loadData();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!visible) return null;
  if (userDataExists === null) return <div>Loading...</div>;
  if (!userDataExists || showUserData) {
    return <UsersData onClose={() => setVisible(false)} />;
  }
  if (!pageData) return <div>Processing data...</div>;



  return (
    <>
      <App
        data={pageData}
        onClose={() => setVisible(false)}
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
            zIndex: 9999
          }}
        >
          {notification.message}
        </div>
      )}
    </>
  );

}
