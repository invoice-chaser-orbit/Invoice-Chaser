import { cn } from "@/lib/utils";

export function DataTable({
  headers,
  children,
  className,
  columnWidths,
  tableClassName,
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  columnWidths?: string[];
  tableClassName?: string;
}) {
  return (
    <div className={cn("glass glass-white overflow-x-auto rounded-lg shadow-sm", className)}>
      <table className={cn("w-full text-left", tableClassName)}>
        {columnWidths && (
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
        )}
        <thead className="bg-neutral-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-6 py-3 text-caption font-medium text-neutral-500 uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function DataRow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function DataCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-6 py-4 text-body text-neutral-700", className)}>{children}</td>;
}
