import React, { useState } from "react";
import FloatingMain from "../clientfacing/display/floatingpages/FloatingMain.jsx";
import JobsTable from "../clientfacing/display/floatingpages/JobsTable.jsx";
import {fetchAllJobs} from "../clientfacing/Feeder/JobDataFeeder.js"

export default function FloatController() {
  const [showJobsTable, setShowJobsTable] = useState(false);
  const [jobsData, setJobsData] = useState([]);

  // This will be called from MainContent's "See All Jobs"
  const handleSeeAll = async () => {
    const data = await fetchAllJobs();
    setJobsData(data);
    setShowJobsTable(true);
  };

  const handleStatusChange = async (jobId, newStatus) => {
    const updatedJobs = await updateJobStatus(jobId, "status", newStatus);
    setJobsData(updatedJobs);
  };

  return (
    <>
      {/* Floating Main panel with MainContent */}
      <FloatingMain onSeeAll={handleSeeAll} />

      {/* Floating Jobs Table, only shows when triggered from MainContent */}
      {showJobsTable && (
        <JobsTable
          jobs={jobsData}
          onStatusChange={handleStatusChange}
          onClose={() => setShowJobsTable(false)}
        />
      )}
    </>
  );
}
