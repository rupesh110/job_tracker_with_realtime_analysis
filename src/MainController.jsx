import React, { useState, useEffect } from "react";
import App from "./display/App.jsx";
import UsersData from "./display/UsersData.jsx";
import { getPageData } from "./utils/getPageData.js";
import { isUserDataAvailable } from "./utils/getUserData.js";

export default function MainController() {
  const [userDataExists, setUserDataExists] = useState(null); // null = loading
  const [pageData, setPageData] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const userExists = await isUserDataAvailable();
      setUserDataExists(userExists);
      if (userExists) {
        const data = await getPageData();
        setPageData(data);
      }
    }
    fetchData();
  }, []);

  if (!visible) return null;

  if (userDataExists === null) {
    return <div>Loading...</div>;
  }

  if (!userDataExists) {
    return <UsersData onClose={() => setVisible(false)} />;
  }

  return <App data={pageData} onClose={() => setVisible(false)} />;
}
