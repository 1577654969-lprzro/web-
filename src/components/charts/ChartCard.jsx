import React from "react";
import { Tooltip } from "recharts";

export const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-card/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-xs font-bold text-text-primary mb-2 border-b border-white/5 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item, index) => {
            const value = item.value;
            const displayValue = formatter 
              ? formatter(value) 
              : (typeof value === 'number' ? value.toLocaleString() : value);
            
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
                    style={{ backgroundColor: item.color || item.fill }}
                  />
                  <span className="text-[11px] text-text-secondary">{item.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-text-primary">
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function ChartCard({ title, children, subtitle }) {
  return (
    <div className="crd p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-text-primary tracking-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 min-h-[300px]">
        {children}
      </div>
    </div>
  );
}
