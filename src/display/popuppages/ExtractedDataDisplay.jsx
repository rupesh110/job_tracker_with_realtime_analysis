import React from "react";
import "./ExtractedDataDisplay.css";

export default function ExtractedDataDisplay({ data }) {
  if (!data) {
    return <p className="loading">Loading data...</p>;
  }

  const { title, gemini } = data;

  return (
    <div className="container">
      <h2>{title}</h2>

      {gemini ? (
        <>
          <h3>Gemini Analysis</h3>
          <p><strong>Summary:</strong> {gemini.summary}</p>
          <p><strong>Match:</strong> {gemini.matchScore}%</p>
          <p><strong>Action Step:</strong> {gemini.actionStep}</p>

          <SkillList title="Resume Strengths" skills={gemini.strengths} />
          <SkillList title="Resume Gaps" skills={gemini.gaps} highlight />
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
        {skills.map((skillItem, i) => (
          <li key={i}>
            <strong>{skillItem.skill}:</strong>{" "}
            {highlight ? skillItem.notes || skillItem.evidence : skillItem.evidence}
          </li>
        ))}
      </ul>
    </div>
  );
}
