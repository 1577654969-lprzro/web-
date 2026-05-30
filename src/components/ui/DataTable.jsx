import useSortable from "../../hooks/useSortable";

export default function DataTable({ columns, rows, rowKey, onRowClick }) {
  const { sorted, sortKey, sortDir, handleSort } = useSortable(rows);

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left py-4 px-5 text-[11px] font-bold text-text-muted uppercase tracking-wider whitespace-nowrap ${
                  col.sortable !== false ? "cursor-pointer hover:text-text-primary transition-colors select-none" : ""
                }`}
                onClick={() => col.sortable !== false && handleSort(col.key)}
              >
                <div className="inline-flex items-center gap-1.5">
                  {col.label}
                  {sortKey === col.key && (
                    <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.02]">
          {sorted.map((row, i) => (
            <tr
              key={rowKey && row[rowKey] ? `${row[rowKey]}-${i}` : i}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-white/[0.03] transition-all duration-150 ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-4 px-5 whitespace-nowrap text-text-secondary text-[13px] font-medium">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
