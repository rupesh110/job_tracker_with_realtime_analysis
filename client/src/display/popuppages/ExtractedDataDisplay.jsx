import React, { useState, useEffect } from "react";
import "./ExtractedDataDisplay.css";
import { getGeminiAnalysis } from "../../Feeder/GeminiJobFeeder"

export default function ExtractedDataDisplay({ data }) {
  const [gemini, setGemini] = useState(null);

  useEffect(() => {
    if (!data) return;

    const fetchGemini = async () => {
      const fullText = document.body.innerText.toLowerCase();
      const geminiResponse = await getGeminiAnalysis(fullText);
      setGemini(geminiResponse?.available || {}); // <- use .available
    };

    fetchGemini();
  }, [data]);

  if (!data) return <p className="loading">Loading data...</p>;

  const { title } = data;

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
        <p>Loading Gemini data...</p>
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
