import { useState, useEffect } from "react";
import { getPageData } from "../utils/getPageData.js";
import { isUserAvailable } from "../Feeder/UsersDataFeeder.js";

export default function usePageData() {
  const [userDataExists, setUserDataExists] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  const loadData = async () => {
    const userExists = await isUserAvailable();
    setUserDataExists(userExists);

    if (userExists) {
      const scrapedData = await getPageData();
      // Ensure title exists
      setPageData({
        title: scrapedData.title || "Untitled",
        description: scrapedData.description || "",
        company: scrapedData.company || "",
        location: scrapedData.location || "",
        ...scrapedData
      });
    }
  };

  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => {
      if (window.location.href !== currentUrl) {
        setCurrentUrl(window.location.href);
        loadData();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentUrl]);

  return { userDataExists, pageData, reloadData: loadData };
}
