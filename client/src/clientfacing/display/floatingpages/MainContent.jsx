import React, { useState, useEffect } from "react";
import JobsTable from "../floatingpages/JobsTable.jsx";
import { fetchAllJobs, updateJobStatus, getAllJobStatus } from "../../Feeder/JobDataFeeder.js";
import "./MainContent.css";

export default function MainContent() {
  const [showTable, setShowTable] = useState(false);
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobCount, setJobCount] = useState({});

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

  // Fetch all jobs from backend
const handleSeeAll = async () => {
  try {
    setLoading(true);
    const data = await fetchAllJobs();
    console.log("From main content fetch all:", data);

    //unwraps if response is { data: [...] } or { jobs: [...] }
    const jobsArray =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.jobs)
        ? data.jobs
        : [];

    console.log("Normalized jobs array:", jobsArray);
    setJobsData(jobsArray);
    setShowTable(true);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
  } finally {
    setLoading(false);
  }
};


  // Update status locally
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const dateObj = new Date();
      const updatedDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;

      const updatedJobs = jobsData.map(job =>
        job.id === jobId
          ? { ...job, status: newStatus, date: updatedDate }
          : job
      );

      setJobsData(updatedJobs);

      // ✅ Recalculate job counts
      const counts = updatedJobs.reduce((acc, job) => {
        const status = job.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      setJobCount(counts);

      // Optionally persist to backend
      // await updateJobStatus(jobId, newStatus, updatedDate);

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

      <button className="see-all-btn" onClick={handleSeeAll} disabled={loading}>
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
