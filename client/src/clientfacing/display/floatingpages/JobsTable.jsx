import React, { useState, useEffect, useRef } from "react";
import { updateJobStatus, updateJobNotes } from "../../Feeder/JobDataFeeder.js";
import "./JobsTable.css";

export default function JobsTable({ jobs, onStatusChange, onClose }) {
  const [jobStatuses, setJobStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // New: selected status filter
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [editingJobKey, setEditingJobKey] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  const panelRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  const statusOptions = [
    "Applied", "Recruiters call", "1st Round", "Interview",
    "Offer", "Rejected", "Unknown", "Follow Up"
  ];

  // Normalize jobs
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
      notes: job.value?.notes || "",
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
    const updatedDate = `${String(dateObj.getDate()).padStart(2,"0")}/${String(dateObj.getMonth()+1).padStart(2,"0")}/${dateObj.getFullYear()}`;

    setJobStatuses((prev) => ({ ...prev, [jobKey]: newStatus }));

    try {
      await updateJobStatus({key:jobKey, newStatus, updatedDate});
    } catch (error) {
      console.error("Failed to update status:", error);
    }

    if (onStatusChange) onStatusChange(jobKey, newStatus, updatedDate);
  };

  const handleSaveNotes = async () => {
    try {
      await updateJobNotes({ key: editingJobKey, notes: editingNotes });
      setEditingJobKey(null);
      setEditingNotes("");
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  };

  // Drag handlers
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

  const getRowColor = (status) => {
    switch (status) {
      case "Applied": return "row-applied";
      case "Recruiters call":
      case "1st Round":
      case "Interview":
      case "Offer": return "row-green";
      case "Rejected": return "row-rejected";
      default: return "row-unknown";
    }
  };

  const filteredJobs = normalizedJobs.filter((job) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      job.value.company.toLowerCase().includes(search) ||
      job.value.title.toLowerCase().includes(search) ||
      job.value.location.toLowerCase().includes(search);

    const matchesStatus = statusFilter ? job.value.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  if (!jobs || jobs.length === 0)
    return <div className="jobs-table-empty">No jobs available</div>;

  return (
    <div className="jobs-table-panel" ref={panelRef} style={{ left: position.x, top: position.y }}>
      <div className="jobs-table-header" onMouseDown={handleMouseDown}>
        <h3>Jobs Table</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {/* Search Input */}
      <input
        type="text"
        className="search-input"
        placeholder="Search by company, title, location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Status Filter Buttons */}
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


      {/* Jobs Table */}
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
              <th>Notes</th>
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
                  <a href={job.value.url} target="_blank" rel="noopener noreferrer" className="link">View</a>
                </td>
                <td>
                  <div
                    className="notes-cell"
                    onClick={() => {
                      setEditingJobKey(job.key);
                      setEditingNotes(job.value.notes);
                    }}
                  >
                    {job.value.notes || <span className="placeholder">Add notes...</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes Popup */}
      {editingJobKey && (
        <div className="notes-popup">
          <h4>Edit Notes</h4>
          <textarea
            value={editingNotes}
            onChange={(e) => setEditingNotes(e.target.value)}
            placeholder="Type your notes here..."
          />
          <div className="notes-popup-buttons">
            <button onClick={handleSaveNotes}>Save</button>
            <button onClick={() => setEditingJobKey(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
