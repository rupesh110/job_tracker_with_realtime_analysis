import React, { useState, useEffect, useRef } from "react";
import "./ExtractedDataDisplay.css";
import { getGeminiAnalysis } from "../../Feeder/GeminiJobFeeder";

export default function ExtractedDataDisplay({ data }) {
  const [gemini, setGemini] = useState(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const ongoingRequest = useRef(false); // prevents overlap

  useEffect(() => {
    if (!data) return;

    const fetchGemini = async () => {
      // Skip if already processing
      if (ongoingRequest.current) return;

      ongoingRequest.current = true;
      setLoadingGemini(true);
      setGemini(null); // reset on new data

      try {
        const fullText = document.body.innerText.toLowerCase();
        const geminiResponse = await getGeminiAnalysis(fullText);
        setGemini(geminiResponse?.available || {});
      } catch (err) {
        console.error("Gemini fetch failed:", err);
      } finally {
        setLoadingGemini(false);
        ongoingRequest.current = false;
      }
    };

    fetchGemini();
  }, [data]);

  if (!data) return <p className="loading">Loading data...</p>;

  const { title } = data;

  return (
    <div className="container">
      <h2>{title}</h2>

      {loadingGemini && <p>Loading Gemini data...</p>}

      {!loadingGemini && gemini && (
        <>
          <h3>Gemini Analysis</h3>
          <p><strong>Summary:</strong> {gemini.summary}</p>
          <p><strong>Match:</strong> {gemini.matchScore}%</p>
          <p><strong>Action Step:</strong> {gemini.actionStep}</p>

          <SkillList title="Resume Strengths" skills={gemini.strengths} />
          <SkillList title="Resume Gaps" skills={gemini.gaps} highlight />
        </>
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
