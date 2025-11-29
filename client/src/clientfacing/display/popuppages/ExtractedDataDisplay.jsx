import React, { useState, useEffect, useRef, useMemo } from "react";
import "./ExtractedDataDisplay.css";
import { getGeminiAnalysis } from "../../Feeder/GeminiJobFeeder";
import { CheckCircle, AlertCircle, Target, ClipboardList } from "lucide-react";

export default function ExtractedDataDisplay({ data }) {
  const [gemini, setGemini] = useState(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [error, setError] = useState(null);
  const ongoingRequest = useRef(false);
  const latestDataRef = useRef(0);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    latestDataRef.current += 1;
    const requestId = latestDataRef.current;
    setGemini(null);
    setError(null);
    setLoadingGemini(true);

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    const fetchGemini = async () => {
      if (ongoingRequest.current) return;
      ongoingRequest.current = true;

      try {
        const jobTitle = data.title || "";
        const jobDescription = data.description || "";

        const geminiResponse = await getGeminiAnalysis({
          data: { jobTitle, jobDescription },
          signal: abortRef.current.signal
        });

        // Update state only if this is still the latest request
        if (latestDataRef.current === requestId) {
          setGemini(geminiResponse || {});
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        console.error("Gemini fetch failed:", err);
        setError('Failed to fetch analysis.');
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

  const sortedDomains = useMemo(() => {
    if (!gemini?.analysis?.domainMatch) return [];
    return [...gemini.analysis.domainMatch].sort((a,b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0));
  }, [gemini]);

  const retryFetch = () => {
    if (!data) return;
    // force re-run effect by simulating data change via increment
    latestDataRef.current += 1;
    setGemini(null);
    setError(null);
    setLoadingGemini(true);
    // reuse effect by calling fetch logic inline
    const jobTitle = data.title || "";
    const jobDescription = data.description || "";
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    getGeminiAnalysis({ data: { jobTitle, jobDescription }, signal: abortRef.current.signal })
      .then(resp => setGemini(resp || {}))
      .catch(err => { if (err?.name !== 'AbortError') setError('Failed to fetch analysis.'); })
      .finally(() => setLoadingGemini(false));
  };

  return (
    <div className="container">
      <h2 className="job-title">{title || "Untitled"}</h2>

      {loadingGemini && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analysing with Gemini...</p>
        </div>
      )}

      {!loadingGemini && error && (
        <div className="error-box" role="alert">
          <span>{error}</span>
          <button className="retry-btn" onClick={retryFetch}>Retry</button>
        </div>
      )}

      {!loadingGemini && !error && !hasGeminiData && (
        <p className="no-data">No Gemini analysis available</p>
      )}

      {hasGeminiData && (
        <>
          <h3 className="section-title">Gemini Analysis</h3>

          {/* Job Match % at top */}
          <div className="match-score-block" aria-label="Job match score">
            <Target className="icon match" />
            <div className="match-progress-wrapper">
              <div className="match-progress-bar-bg" aria-hidden="true">
                <div
                  className="match-progress-bar-fill"
                  style={{ width: `${Math.min(100, gemini.matchScore ?? 0)}%` }}
                />
              </div>
              <div className="match-score-text">
                <strong>Job Match:</strong> {gemini.matchScore ?? 0}%
              </div>
            </div>
          </div>

          {gemini.titleAnalysis?.related && (
            <>
              <div className="section-group compact-list">
                <h3 className="section-heading"><AlertCircle size={18}/> Resume Gaps (Improve)</h3>
                <SkillList title={""} skills={gemini.gaps} highlight />
              </div>

              {sortedDomains.length > 0 && (
                <div className="section-group compact-list">
                  <h3 className="section-heading"><ClipboardList size={18}/> Domain Analysis</h3>
                  <div className="domain-analysis">
                    {sortedDomains.map((domain, idx) => (
                        <div key={idx} className="domain-item">
                          <h4>{domain.domain}</h4>
                          <p><strong>Required Skills:</strong> {domain.requiredSkills.join(", ")}</p>
                          <p><strong>Matched Skills:</strong> {domain.matchedSkills.join(", ") || "None"}</p>
                          <p><strong>Match:</strong> {domain.matchPercentage}%</p>
                        <div className="domain-metrics">
                          <div className="domain-bar-bg" aria-hidden="true">
                            <div
                              className="domain-bar-fill"
                              style={{ width: `${Math.min(100, domain.matchPercentage ?? 0)}%` }}
                            />
                          </div>
                          <div className="domain-count">
                            {domain.matchedSkills.length}/{domain.requiredSkills.length} skills
                          </div>
                        </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="section-group compact-list">
                <h3 className="section-heading"><CheckCircle size={18}/> Resume Strengths (Leverage)</h3>
                <SkillList title={""} skills={gemini.strengths} />
              </div>
            </>
          )}

          {/* Secondary summary info moved below skills */}
          <div className="summary-cards">
            <div className="summary-card">
              <ClipboardList className="icon summary" />
              <p>
                <strong>Summary:</strong> {gemini.summary || "N/A"}
              </p>
            </div>
            <div className="summary-card">
              <CheckCircle className="icon action" />
              <p>
                <strong>Action Step:</strong> {gemini.actionStep || "N/A"}
              </p>
            </div>
          </div>

          {gemini.titleAnalysis?.related ? null : (
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