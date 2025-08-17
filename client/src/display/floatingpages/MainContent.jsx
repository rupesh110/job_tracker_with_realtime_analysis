import React, { useState, useEffect } from "react";
import JobsTable from "../floatingpages/JobsTable.jsx";
import { getJobStatusCounts, getJobData, updateJobData } from "../../data/jobConfig";
import "./MainContent.css";

export default function MainContent() {
  const [jobCount, setJobCount] = useState({});
  const [showTable, setShowTable] = useState(false);
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch job counts
  useEffect(() => {
    async function fetchCounts() {
      const counts = await getJobStatusCounts();
      setJobCount(counts);
    }
    fetchCounts();
  }, []);

  // Show jobs table
  const handleSeeAll = async () => {
    try {
      setLoading(true);
      const data = await getJobData();
      setJobsData(data);
      setShowTable(true);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle status update & update counts dynamically
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const updatedJobs = await updateJobData(jobId, "status", newStatus);
      setJobsData(updatedJobs);

      // Recalculate counts based on updated jobs
      const counts = updatedJobs.reduce(
        (acc, job) => {
          const status = job.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { Applied: 0, "In Progress": 0, "Follow Up": 0 }
      );
      setJobCount(counts);
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  return (
    <div className="main-content">
      <h2 className="main-title">Job Helper</h2>

      <div className="job-counts">
        <p>Applied: <span>{jobCount.Applied || 0}</span></p>
        <p>In Progress: <span>{jobCount["In Progress"] || 0}</span></p>
        <p>Follow Up: <span>{jobCount["Follow Up"] || 0}</span></p>
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
