import React, { useState, useEffect, useRef } from "react";
import { updateJobStatus, updateJobNotes } from "../../Feeder/JobDataFeeder.js";
import "./JobsTable.css";

export default function JobsTable({ jobs, onStatusChange, onClose }) {
  const [jobStatuses, setJobStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  const panelRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  const statusOptions = [
    "Applied",
    "Recruiters call",
    "1st Round",
    "Interview",
    "Offer",
    "Rejected",
    "Follow Up",
    "Unknown",
  ];

 
  // Initialize statuses
  useEffect(() => {
    const initialStatuses = jobs.reduce((acc, job) => {
      acc[job.id] = job.status || "Unknown";
      return acc;
    }, {});
    setJobStatuses(initialStatuses);
  }, [jobs]);

  // Update job status
  const handleStatusChange = async (jobId, newStatus) => {
    const dateObj = new Date();
    const updatedDate = dateObj.toISOString().split("T")[0];

    setJobStatuses((prev) => ({ ...prev, [jobId]: newStatus }));

    try {
      await updateJobStatus({ id: jobId, newStatus, updatedDate });
    } catch (error) {
      console.error("Failed to update status:", error);
    }

    if (onStatusChange) onStatusChange(jobId, newStatus, updatedDate);
  };

  // Save edited notes
  const handleSaveNotes = async () => {
    try {
      await updateJobNotes({ id: editingJobId, notes: editingNotes });
      setEditingJobId(null);
      setEditingNotes("");
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  };

  // Drag logic (unchanged)
  const handleMouseDown = (e) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
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

  // Row color helper
  const getRowColor = (status) => {
    switch (status) {
      case "Applied":
        return "row-applied";
      case "Recruiters call":
      case "1st Round":
      case "Interview":
      case "Offer":
        return "row-green";
      case "Rejected":
        return "row-rejected";
      default:
        return "row-unknown";
    }
  };

  // Filter + search
  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      job.company?.toLowerCase().includes(search) ||
      job.title?.toLowerCase().includes(search) ||
      job.location?.toLowerCase().includes(search);
    const matchesStatus = statusFilter ? job.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (!jobs || jobs.length === 0)
    return <div className="jobs-table-empty">No jobs available</div>;

  return (
    <div
      className="jobs-table-panel"
      ref={panelRef}
      style={{ left: position.x, top: position.y }}
    >
      <div className="jobs-table-header" onMouseDown={handleMouseDown}>
        <h3>Jobs Table</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      {/* 🔍 Search */}
      <input
        type="text"
        className="search-input"
        placeholder="Search by company, title, location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Status Filter */}
      <div className="status-filters">
        <button
          className={`status-filter-button ${statusFilter === "" ? "active" : ""}`}
          onClick={() => setStatusFilter("")}
        >
          All
        </button>
        {statusOptions.map((status) => (
          <button
            key={status}
            className={`status-filter-button ${statusFilter === status ? "active" : ""}`}
            onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 📋 Table */}
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
              <th>Date</th>
              <th>URL</th>
              <th>Notes</th>
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
                    value={jobStatuses[job.id] || "Unknown"}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{job.platform}</td>
                <td>{job.work_type}</td>
                <td>{job.date || "—"}</td>
                <td>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    View
                  </a>
                </td>
                <td>
                  <div
                    className="notes-cell"
                    onClick={() => {
                      setEditingJobId(job.id);
                      setEditingNotes(job.notes || "");
                    }}
                  >
                    {job.notes || <span className="placeholder">Add notes...</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✏️ Notes Popup */}
      {editingJobId && (
        <div className="notes-popup">
          <h4>Edit Notes</h4>
          <textarea
            value={editingNotes}
            onChange={(e) => setEditingNotes(e.target.value)}
            placeholder="Type your notes here..."
          />
          <div className="notes-popup-buttons">
            <button onClick={handleSaveNotes}>Save</button>
            <button onClick={() => setEditingJobId(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
