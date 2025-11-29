import React, { useState, useEffect, useRef, useMemo } from "react";
import { updateJobStatus, updateJobNotes } from "../../Feeder/JobDataFeeder.js";
import "./JobsTable.css";

export default function JobsTable({ jobs, onStatusChange, onClose }) {
  const [jobStatuses, setJobStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [scrolled, setScrolled] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  const panelRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  // (wrapperRef removed - no longer needed after summary bar removal)

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

  const sortedJobs = useMemo(() => {
    if (!sortConfig.key) return filteredJobs;
    const sorted = [...filteredJobs].sort((a,b) => {
      const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
      const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredJobs, sortConfig]);

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // toggle direction
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

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



      {/* Search */}
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
      <div className={`table-wrapper ${scrolled ? 'scrolled' : ''}`} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}>
        <table className="jobs-table">
          <thead>
            <tr>
              <th
                tabIndex={0}
                onClick={() => toggleSort('company')}
                onKeyDown={(e) => e.key === 'Enter' && toggleSort('company')}
                className={`sortable ${sortConfig.key === 'company' ? sortConfig.direction : ''}`}
                aria-sort={sortConfig.key === 'company' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Company
                <span className="sr-only">Sort by company</span>
              </th>
              <th
                tabIndex={0}
                onClick={() => toggleSort('title')}
                onKeyDown={(e) => e.key === 'Enter' && toggleSort('title')}
                className={`sortable ${sortConfig.key === 'title' ? sortConfig.direction : ''}`}
                aria-sort={sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Title
                <span className="sr-only">Sort by title</span>
              </th>
              <th
                tabIndex={0}
                onClick={() => toggleSort('location')}
                onKeyDown={(e) => e.key === 'Enter' && toggleSort('location')}
                className={`sortable ${sortConfig.key === 'location' ? sortConfig.direction : ''}`}
                aria-sort={sortConfig.key === 'location' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Location
                <span className="sr-only">Sort by location</span>
              </th>
              <th>Status</th>
              <th>Platform</th>
              <th
                tabIndex={0}
                onClick={() => toggleSort('work_type')}
                onKeyDown={(e) => e.key === 'Enter' && toggleSort('work_type')}
                className={`sortable ${sortConfig.key === 'work_type' ? sortConfig.direction : ''}`}
                aria-sort={sortConfig.key === 'work_type' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Work Type
                <span className="sr-only">Sort by work type</span>
              </th>
              <th
                tabIndex={0}
                onClick={() => toggleSort('date')}
                onKeyDown={(e) => e.key === 'Enter' && toggleSort('date')}
                className={`sortable ${sortConfig.key === 'date' ? sortConfig.direction : ''}`}
                aria-sort={sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Date
                <span className="sr-only">Sort by date</span>
              </th>
              <th>URL</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job) => (
              <tr key={job.id} className={getRowColor(jobStatuses[job.id])}>
                <td className={`${sortConfig.key === 'company' ? 'sorted-col' : ''}`}>{job.company}</td>
                <td className={`${sortConfig.key === 'title' ? 'sorted-col' : ''}`}>{job.title}</td>
                <td className={`${sortConfig.key === 'location' ? 'sorted-col' : ''}`}>{job.location}</td>
                <td>
                  <select
                    value={jobStatuses[job.id] || "Unknown"}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    className={`status-select status-${(jobStatuses[job.id] || 'Unknown')
                      .replace(/\s+/g,'-')
                      .toLowerCase()}`}
                    aria-label={`Change status for ${job.company || 'job'}: ${(jobStatuses[job.id] || 'Unknown')}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{job.platform}</td>
                <td className={`${sortConfig.key === 'work_type' ? 'sorted-col' : ''}`}>{job.work_type}</td>
                <td className={`${sortConfig.key === 'date' ? 'sorted-col' : ''}`}>{job.date || "—"}</td>
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
