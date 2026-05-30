export default function KPICard({ label, value, unit, change, changeLabel, inverse }) {
  const isPositive = inverse ? change < 0 : change > 0;
  const isNeutral = change === 0;

  return (
    <div className="crd p-6 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${
        isNeutral ? "bg-text-muted" : isPositive ? "bg-positive" : "bg-negative"
      }`} />
      
      <p className="text-[12px] text-text-muted font-bold uppercase tracking-wider mb-3">{label}</p>
      
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-text-primary tracking-tighter">
          {typeof value === "number"
            ? value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : value}
        </span>
        {unit && <span className="text-sm text-text-muted font-bold">{unit}</span>}
      </div>

      {changeLabel && (
        <div className="mt-4 flex items-center gap-2">
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isNeutral
                ? "text-text-muted bg-white/5"
                : isPositive
                ? "text-positive bg-positive/10"
                : "text-negative bg-negative/10"
            }`}
          >
            <span className="text-[10px]">{isNeutral ? "•" : isPositive ? "▲" : "▼"}</span>
            {Math.abs(change).toFixed(2)}%
          </div>
          <span className="text-[11px] text-text-muted font-medium italic">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
