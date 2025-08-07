import React from "react";
import "./ExtractedDataDisplay.css";

export default function ExtractedDataDisplay({ data }) {
  if (!data) {
    return <p className="loading">Loading data...</p>;
  }

  const { title, company, location, gemini } = data;

  return (
    <div className="container">
      <h2>{title}</h2>
      <p><strong>Company:</strong> {company}</p>
      <p><strong>Location:</strong> {location}</p>

      {gemini ? (
        <>
          <h3>Gemini Analysis</h3>
          <p><strong>Domain:</strong> {gemini.domain}</p>
          <p><strong>Match %:</strong> {gemini.match_percentage}%</p>

          <SkillList title="Job Skills" skills={gemini.job_skills} />
          <SkillList title="Missing Skills" skills={gemini.missing_skills} highlight />
        </>
      ) : (
        <p>No Gemini data available.</p>
      )}
    </div>
  );
}

function SkillList({ title, skills, highlight }) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="skill-list">
      <h4>{title}</h4>
      <ul className={highlight ? "highlight" : ""}>
        {skills.map((skill, i) => (
          <li key={i}>{skill}</li>
        ))}
      </ul>
    </div>
  );
}
