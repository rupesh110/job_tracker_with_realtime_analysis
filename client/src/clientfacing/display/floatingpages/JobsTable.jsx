import React, { useState, useEffect, useRef } from "react";
import { updateJobStatus } from "../../Feeder/JobDataFeeder.js";
import "./JobsTable.css";

export default function JobsTable({ jobs, onStatusChange, onClose }) {
  const [jobStatuses, setJobStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const panelRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  // Normalize job fields and initialize statuses
  const normalizedJobs = jobs.map((job) => ({
    ...job,
    value: {
      company: job.value?.company || "Unknown",
      title: job.value?.title || "Unknown",
      location: job.value?.location || "Unknown",
      status: job.value?.status || "Unknown",
      platform: job.value?.platform || "Unknown",
      workType: job.value?.workType || "Unknown",
      date: job.value?.date || "Unknown",
      url: job.value?.url || "#",
    },
  }));

  useEffect(() => {
    const initialStatuses = normalizedJobs.reduce((acc, job) => {
      acc[job.key] = job.value.status;
      return acc;
    }, {});
    setJobStatuses(initialStatuses);
  }, [jobs]);

  const handleStatusChange = async (jobKey, newStatus) => {
    const dateObj = new Date();
    const updatedDate = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`;

    setJobStatuses((prev) => ({ ...prev, [jobKey]: newStatus }));

    try {
      await updateJobStatus({ key: jobKey, newStatus, updatedDate });
    } catch (error) {
      console.error("Failed to update status:", error);
    }

    if (onStatusChange) onStatusChange(jobKey, newStatus, updatedDate);
  };


  // Dragging handlers
  const handleMouseDown = (e) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  };
  const handleMouseUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

    const statusOptions = [
      "Applied",
      "Recruiters call",
      "1st Round",
      "Interview",
      "Offer",
      "Rejected",
      "Unknown",
      "Follow Up"
    ];

    const getRowColor = (status) => {
      switch (status) {
        case "Applied":
          return "row-applied";
        case "Recruiters call":
        case "1st Round":
        case "Interview":
        case "Offer":
          return "row-green"; // all in-progress/interview stages as green
        case "Rejected":
          return "row-rejected";
        case "Follow Up":
        default:
          return "row-unknown";
      }
    };

  // Safe filtering
  const filteredJobs = normalizedJobs.filter((job) => {
    const search = searchTerm.toLowerCase();
    return (
      job.value.company.toLowerCase().includes(search) ||
      job.value.title.toLowerCase().includes(search) ||
      job.value.location.toLowerCase().includes(search)
    );
  });

  if (!jobs || jobs.length === 0) return <div className="jobs-table-empty">No jobs available</div>;

  return (
    <div className="jobs-table-panel" ref={panelRef} style={{ left: position.x, top: position.y }}>
      <div className="jobs-table-header" onMouseDown={handleMouseDown}>
        <h3>Jobs Table</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search by company, title, location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-wrapper">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Title</th>
              <th>Location</th>
              <th>Status</th>
              <th>Platform</th>
              <th>Work Type</th>
              <th>Updated on</th>
              <th>URL</th>
       
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.key} className={getRowColor(jobStatuses[job.key])}>
                <td>{job.value.company}</td>
                <td>{job.value.title}</td>
                <td>{job.value.location}</td>
                <td>
                  <select
                    value={jobStatuses[job.key]}
                    onChange={(e) => handleStatusChange(job.key, e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>{job.value.platform}</td>
                <td>{job.value.workType}</td>
                <td>{job.value.date}</td>
                <td>
                  <a href={job.value.url} target="_blank" rel="noopener noreferrer" className="link">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
