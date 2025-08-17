import React, { useState, useEffect, useRef } from "react";
import "./JobsTable.css";

export default function JobsTable({ jobs, onStatusChange, onClose }) {
  const [jobStatuses, setJobStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const panelRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  // Initialize job statuses
  useEffect(() => {
    const initialStatuses = jobs.reduce((acc, job) => {
      acc[job.id] = job.status || "Unknown";
      return acc;
    }, {});
    setJobStatuses(initialStatuses);
  }, [jobs]);

  const handleStatusChange = (jobId, newStatus) => {
    setJobStatuses((prev) => ({ ...prev, [jobId]: newStatus }));
    if (onStatusChange) onStatusChange(jobId, newStatus);
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const statusOptions = ["Applied", "Interview", "Offer", "Rejected", "Unknown"];

  const getRowColor = (status) => {
    switch (status) {
      case "Applied": return "row-applied";
      case "Rejected": return "row-rejected";
      case "Interview":
      case "Offer": return "row-green";
      case "Unknown": return "row-unknown";
      default: return "";
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!jobs || jobs.length === 0) return <div className="jobs-table-empty">No jobs available</div>;

  return (
    <div
      className="jobs-table-panel"
      ref={panelRef}
      style={{ left: position.x, top: position.y }}
    >
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
              <th>Applied on</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id} className={getRowColor(jobStatuses[job.id])}>
                <td>{job.company}</td>
                <td>{job.title}</td>
                <td>{job.location}</td>
                <td>
                  <select
                    value={jobStatuses[job.id]}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>{job.platform}</td>
                <td>{job.workType}</td>
                <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                <td>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="link">
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
