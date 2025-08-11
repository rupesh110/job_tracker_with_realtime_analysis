import React, { useState, useEffect } from "react";
import App from "./App.jsx";
import UsersData from "./UsersData.jsx";
import { getPageData } from "../utils/getPageData.js";
import { isUserDataAvailable } from "../utils/getUserData.js";
import { testBackground } from "../integrate/postspreadsheet.js";

export default function MainController() {
  const [userDataExists, setUserDataExists] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [visible, setVisible] = useState(true);
  const [showUserData, setShowUserData] = useState(false);
  const [saveData, setSaveData] = useState(false);

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

  // Watch for saveData changes
  useEffect(() => {
    if (saveData && pageData) {
      testBackground(pageData); // ✅ Use pageData from state
      setSaveData(false); // reset flag
    }
  }, [saveData, pageData]);

  useEffect(() => {
    loadData();

    // Watch for URL changes
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
    <App
      data={pageData}
      onClose={() => setVisible(false)}
      onChangeDataClick={() => setShowUserData(true)}
      onSaveButton={() => setSaveData(true)}
    />
  );
}
