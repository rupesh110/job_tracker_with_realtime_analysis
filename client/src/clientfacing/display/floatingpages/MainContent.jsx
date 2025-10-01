import React, { useState, useEffect } from "react";
import JobsTable from "../floatingpages/JobsTable.jsx";
import { fetchAllJobs, updateJobStatus, getAllJobStatus } from "../../Feeder/JobDataFeeder.js";

import "./MainContent.css";

export default function MainContent() {
  const [showTable, setShowTable] = useState(false);
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobCount, setJobCount] = useState({});

  // Fetch job statuses on mount
  useEffect(() => {
    async function fetchStatuses() {
      try {
        const response = await getAllJobStatus(); 
        setJobCount(response.items || {});
      } catch (err) {
        console.error("Failed to fetch job statuses:", err);
      }
    }
    fetchStatuses();
  }, []);

  // Fetch all jobs when user clicks "See All Jobs"
  const handleSeeAll = async () => {
    try {
      setLoading(true);
      const data = await fetchAllJobs();
      console.log("from maincontent:", data)
      setJobsData(Array.isArray(data) ? data : []);
      setShowTable(true);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (jobKey, newStatus) => {
    try {
      await updateJobStatus({ key: jobKey, newStatus });

      const updatedJobs = jobsData.map(job =>
        job.key === jobKey ? { ...job, value: { ...job.value, status: newStatus } } : job
      );
      setJobsData(updatedJobs);

      // update counts
      const counts = updatedJobs.reduce((acc, job) => {
        const status = job.value?.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      setJobCount(counts);

    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };


  return (
    <div className="main-content">
      <h2 className="main-title">Job Summary</h2>

      <div className="job-counts">
        {Object.entries(jobCount).map(([status, count]) => (
          <p key={status}>
            {status}: <span>{count}</span>
          </p>
        ))}
      </div>

      <button
        className="see-all-btn"
        onClick={handleSeeAll}
        disabled={loading}
      >
        {loading ? "Loading..." : "See All Jobs"}
      </button>

      {showTable && (
        <JobsTable
          jobs={jobsData}
          onStatusChange={handleStatusChange}
          onClose={() => setShowTable(false)}
        />
      )}
    </div>
  );
}
