import { useEffect, useState } from "react";
import { getTrialSuggestions, getTrialSuggestionsResults } from "../services/patientApi";

// ── Parse raw recommendation text into structured trial objects ───────────────
function parseRecommendation(text, retrievedTrials = []) {
  if (!text) return [];

  const trialMap = {};
  for (const t of retrievedTrials) {
    const id = t.nct_number || t._doc_id;
    if (id) trialMap[id] = t;
  }

  // Split on each **Trial N: block
  const blocks = text.split(/(?=\*\*Trial\s+\d+:)/g).filter(b => b.trim());
  const results = [];

  for (const block of blocks) {
    const nctMatch     = block.match(/NCT\d{8}/);
    const verdictMatch = block.match(/VERDICT\s*:\s*(ELIGIBLE|INELIGIBLE|BORDERLINE)/i);
    if (!nctMatch || !verdictMatch) continue;

    const nctId   = nctMatch[0];
    const verdict = verdictMatch[1].toUpperCase();

    // Title — extract from **Trial N: NCTID — Title** line
    const titleMatch = block.match(/\*\*Trial\s+\d+:\s*NCT\d{8}\s*[—–\-]+\s*(.+?)\*\*/);
    const title = titleMatch ? titleMatch[1].trim() : nctId;

    // Matched Criteria
    const matchedSection = block.match(/Matched Criteria\s*:\s*([\s\S]*?)(?=\nConcerns\s*:)/i);
    const matched = matchedSection
      ? matchedSection[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean)
      : [];

    // Concerns
    const concernsSection = block.match(/Concerns\s*:\s*([\s\S]*?)(?=\nIntervention Summary\s*:)/i);
    const concernsRaw = concernsSection
      ? concernsSection[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean)
      : [];
    const concerns = concernsRaw.filter(c => c.toLowerCase() !== "none");

    // Intervention Summary
    const interventionMatch = block.match(/Intervention Summary\s*:\s*(.+?)(?=\nClinical Rationale\s*:)/is);
    const intervention = interventionMatch ? interventionMatch[1].trim() : "";

    // Clinical Rationale — stop at --- or next **Trial or Disclaimer
    const rationaleMatch = block.match(/Clinical Rationale\s*:\s*([\s\S]*?)(?=\n---|$)/i);
    const rationale = rationaleMatch
      ? rationaleMatch[1].replace(/Disclaimer:.*/is, "").trim()
      : "";

    const trialData = trialMap[nctId] || {};

    results.push({
      nctId,
      title:       trialData.study_title || trialData.title || title,
      verdict,
      matched,
      concerns,
      intervention,
      rationale,
      phase:       trialData.phase || null,
      status:      trialData.recruitment_status || null,
      summary:     trialData.brief_summary || null,
      url:         trialData.study_url || `https://clinicaltrials.gov/study/${nctId}`,
    });
  }

  // Only return ELIGIBLE and BORDERLINE — discard INELIGIBLE
  return results.filter(t => t.verdict !== "INELIGIBLE");
}

// ── Verdict config ────────────────────────────────────────────────────────────
const VERDICT = {
  ELIGIBLE:   { label: "Eligible",   bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500"  },
  BORDERLINE: { label: "Borderline", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
  INELIGIBLE: { label: "Ineligible", bg: "bg-red-100",    text: "text-red-600",    border: "border-red-200",    dot: "bg-red-500"    },
};

// ── Single Trial Card ─────────────────────────────────────────────────────────
function TrialCard({ trial, index }) {
  const [expanded, setExpanded] = useState(false);
  const v = VERDICT[trial.verdict] || VERDICT.BORDERLINE;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${v.border}`}>

      {/* Card header — always visible */}
      <div
        className="flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 shrink-0">#{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 leading-snug">{trial.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 font-mono">{trial.nctId}</span>
            {trial.phase && <span className="text-xs text-gray-400">· {trial.phase}</span>}
            {trial.status && (
              <span className="text-xs text-gray-400 capitalize">
                · {trial.status.toLowerCase().replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
            {v.label}
          </span>
          <span className="text-gray-400 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">

          {/* Matched Criteria */}
          {trial.matched.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Matched criteria
              </p>
              <ul className="space-y-1">
                {trial.matched.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {trial.concerns.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Concerns
              </p>
              <ul className="space-y-1">
                {trial.concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-yellow-500 mt-0.5 shrink-0">⚠</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Intervention */}
          {trial.intervention && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Intervention
              </p>
              <p className="text-sm text-gray-600">{trial.intervention}</p>
            </div>
          )}

          {/* Rationale */}
          {trial.rationale && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                Clinical rationale
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{trial.rationale}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            {trial.summary && (
              <p className="text-xs text-gray-400 line-clamp-2 flex-1 mr-4">{trial.summary}</p>
            )}
            <a
              href={trial.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline whitespace-nowrap shrink-0"
              onClick={e => e.stopPropagation()}
            >
              View on ClinicalTrials.gov →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary bar ───────────────────────────────────────────────────────────────
function SummaryBar({ trials, totalReviewed }) {
  const counts = trials.reduce((acc, t) => {
    acc[t.verdict] = (acc[t.verdict] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex gap-2 flex-wrap mb-4 items-center">
      {Object.entries(VERDICT)
        .filter(([key]) => key !== "INELIGIBLE")
        .map(([key, v]) => counts[key] ? (
          <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
            {counts[key]} {v.label}
          </span>
        ) : null)}
      <span className="text-xs text-gray-400">{trials.length} of {totalReviewed} trials matched</span>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────
export default function TrialSuggestionsTab() {
  const [status, setStatus]           = useState("idle");
  const [results, setResults]         = useState(null);
  const [parsedTrials, setParsedTrials] = useState([]);
  const [error, setError]             = useState(null);
  const [pollInterval, setPollInterval] = useState(null);

  useEffect(() => {
    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, [pollInterval]);

  const stopPolling = id => { clearInterval(id); setPollInterval(null); };

  const startPolling = () => {
    const id = setInterval(async () => {
      try {
        const data = await getTrialSuggestionsResults();
        if (["completed", "guardrail_flagged", "guardrail_blocked", "failed"].includes(data.status)) {
          setResults(data);
          setParsedTrials(parseRecommendation(data.recommendation, data.retrieved_trials));
          setStatus("completed");
          stopPolling(id);
        }
      } catch (err) {
        setError(err.message);
        setStatus("failed");
        stopPolling(id);
      }
    }, 4000);
    setPollInterval(id);
  };

  const handleFetch = async () => {
    if (pollInterval) stopPolling(pollInterval);
    setStatus("submitting");
    setError(null);
    setResults(null);
    setParsedTrials([]);
    try {
      await getTrialSuggestions();
      setStatus("processing");
      startPolling();
    } catch (err) {
      setError(err.message);
      setStatus("failed");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">🧬 Clinical Trial Suggestions</h3>
        {status === "completed" && (
          <button onClick={handleFetch} className="text-xs text-blue-600 hover:underline">
            ↺ Refresh
          </button>
        )}
      </div>

      <div className="px-5 py-4">

        {/* Idle */}
        {status === "idle" && (
          <div className="text-center py-10 space-y-4">
            <p className="text-gray-500 text-sm">
              Click below to find clinical trials that match your profile.
            </p>
            <button onClick={handleFetch} className="btn-primary px-6 py-2.5">
              Find Matching Trials
            </button>
          </div>
        )}

        {/* Submitting */}
        {status === "submitting" && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">Submitting your request...</p>
          </div>
        )}

        {/* Processing */}
        {status === "processing" && (
          <div className="text-center py-10 space-y-4">
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-gray-600 text-sm font-medium">Analyzing your profile...</p>
            <p className="text-gray-400 text-xs">This may take 30–60 seconds.</p>
          </div>
        )}

        {/* Error */}
        {status === "failed" && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              ❌ {error}
            </div>
            <button onClick={handleFetch} className="btn-secondary text-xs">↺ Try Again</button>
          </div>
        )}

        {/* Completed */}
        {status === "completed" && results && (
          <div className="space-y-3">

            {/* Parsed trial cards */}
            {parsedTrials.length > 0 && (
              <>
                <SummaryBar trials={parsedTrials} totalReviewed={results.retrieved_trials?.length || 0} />
                <div className="space-y-2">
                  {parsedTrials.map((t, i) => (
                    <TrialCard key={t.nctId} trial={t} index={i} />
                  ))}
                </div>
              </>
            )}

            {/* Fallback: raw text if parsing yielded nothing */}
            {parsedTrials.length === 0 && results.recommendation && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {results.recommendation}
              </div>
            )}

            {/* Footer */}
            {results.generated_at && (
              <p className="text-xs text-gray-400 pt-1">
                Generated: {new Date(results.generated_at).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}