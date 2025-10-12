import React, { useState, useEffect, useRef } from "react";
import "./ExtractedDataDisplay.css";
import { getGeminiAnalysis } from "../../Feeder/GeminiJobFeeder";
import { CheckCircle, AlertCircle, Target, ClipboardList } from "lucide-react";

export default function ExtractedDataDisplay({ data }) {
  const [gemini, setGemini] = useState(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const ongoingRequest = useRef(false);
  const latestDataRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    const currentDataId = Date.now(); 
    latestDataRef.current = currentDataId;
    setGemini(null);
    setLoadingGemini(true);

    const fetchGemini = async () => {
      if (ongoingRequest.current) return;
      ongoingRequest.current = true;

      try {
        const jobTitle = data.title || "";
        const jobDescription = data.description || "";

        const geminiResponse = await getGeminiAnalysis({
          data: { jobTitle, jobDescription },
        });

        

        // Update state only if this is still the latest request
        if (latestDataRef.current === currentDataId) {
          setGemini(geminiResponse || {}); // don't just use .available
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
      <h2 className="job-title">{title || "Untitled"}</h2>

      {loadingGemini && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analyzing with Gemini...</p>
        </div>
      )}

      {!loadingGemini && !hasGeminiData && (
        <p className="no-data">No Gemini analysis available</p>
      )}

      {hasGeminiData && (
        <>
          <h3 className="section-title">Gemini Analysis</h3>

          <div className="summary-cards">
            <div className="summary-card">
              <ClipboardList className="icon summary" />
              <p>
                <strong>Summary:</strong> {gemini.summary || "N/A"}
              </p>
            </div>
            <div className="summary-card">
              <Target className="icon match" />
              <p>
                <strong>Match:</strong> {gemini.matchScore ?? 0}%
              </p>
            </div>
            <div className="summary-card">
              <CheckCircle className="icon action" />
              <p>
                <strong>Action Step:</strong> {gemini.actionStep || "N/A"}
              </p>
            </div>
          </div>

          {gemini.titleAnalysis?.related ? (
            <>
              {/* Resume Strengths & Gaps */}
              <SkillList title="Resume Strengths" skills={gemini.strengths} />
              <SkillList title="Resume Gaps" skills={gemini.gaps} highlight />

              {/* Domain Analysis */}
              {gemini.analysis?.domainMatch && (
                <div className="domain-analysis">
                  <h3>Domain Analysis</h3>
                  {gemini.analysis.domainMatch.map((domain, idx) => (
                    <div key={idx} className="domain-item">
                      <h4>{domain.domain}</h4>
                      <p>
                        <strong>Required Skills:</strong>{" "}
                        {domain.requiredSkills.join(", ")}
                      </p>
                      <p>
                        <strong>Matched Skills:</strong>{" "}
                        {domain.matchedSkills.join(", ") || "None"}
                      </p>
                      <p>
                        <strong>Match:</strong> {domain.matchPercentage}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Show recommendation if job is NOT related */
            <div className="recommendation">
              <AlertCircle className="icon recommend" />
              <div>
                <h3>Recommendation</h3>
                <p>
                  {gemini.titleAnalysis?.recommendation ||
                    "No recommendation available"}
                </p>
              </div>
            </div>
          )}
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
            {highlight
              ? skillItem.notes || skillItem.evidence
              : skillItem.evidence || "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
}