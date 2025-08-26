import React, { useState, useEffect, useRef } from "react";
import "./ExtractedDataDisplay.css";
import { getGeminiAnalysis } from "../../Feeder/GeminiJobFeeder";

export default function ExtractedDataDisplay({ data }) {
  const [gemini, setGemini] = useState(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const ongoingRequest = useRef(false);
  const latestDataRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    latestDataRef.current = data;
    setGemini(null);
    setLoadingGemini(true);

    const fetchGemini = async () => {
      if (ongoingRequest.current) return;
      ongoingRequest.current = true;

      try {
        const relevantText = data.description || document.body.innerText;
        const geminiResponse = await getGeminiAnalysis(relevantText.toLowerCase());

        if (latestDataRef.current === data) {
          setGemini(geminiResponse?.available || null);
        }
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
  const hasGeminiData = gemini && Object.keys(gemini).length > 0;

  return (
    <div className="container">
      <h2>{title || "Untitled"}</h2>

      {loadingGemini && <p>Loading Gemini data...</p>}
      {!loadingGemini && !hasGeminiData && <p>No Gemini analysis available</p>}

      {hasGeminiData && (
        <>
          <h3>Gemini Analysis</h3>
          <p><strong>Summary:</strong> {gemini.summary || "N/A"}</p>
          <p><strong>Match:</strong> {gemini.matchScore ?? 0}%</p>
          <p><strong>Action Step:</strong> {gemini.actionStep || "N/A"}</p>

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
            <strong>{skillItem.skill || "Unknown Skill"}:</strong>{" "}
            {highlight ? skillItem.notes || skillItem.evidence : skillItem.evidence || "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
}
