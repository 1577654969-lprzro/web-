const severityConfig = {
  info: { bg: "bg-accent/10", border: "border-accent/20", dot: "bg-accent", label: "信息" },
  warning: { bg: "bg-warning/10", border: "border-warning/20", dot: "bg-warning", label: "关注" },
  critical: { bg: "bg-negative/10", border: "border-negative/20", dot: "bg-negative", label: "严重" },
};

function ResultCard({ result }) {
  const s = severityConfig[result.severity];
  return (
    <div className={`mt-3 rounded-[14px] p-4 border ${s.bg} ${s.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
        <span className="text-xs font-semibold tracking-wide">{s.label}</span>
      </div>
      <p className="text-sm font-medium text-text-primary leading-relaxed">{result.diagnosis}</p>
      {result.evidence.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-[11px] text-text-muted uppercase tracking-wider">数据支撑</p>
          {result.evidence.map((e, i) => (
            <p key={i} className="text-xs text-text-secondary font-mono">{e}</p>
          ))}
        </div>
      )}
      {result.suggestions.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-[11px] text-text-muted uppercase tracking-wider">建议措施</p>
          {result.suggestions.map((s, i) => (
            <p key={i} className="text-xs text-text-secondary flex gap-2 before:content-['→'] before:text-accent">{s}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalysisMessage({ role, content, result }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[90%] ${isUser ? "order-1" : ""}`}>
        <div
          className={`rounded-[14px] px-4 py-2.5 text-sm ${
            isUser
              ? "bg-accent text-white"
              : "bg-bg-card text-text-primary border border-border"
          }`}
        >
          {content}
        </div>
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}
