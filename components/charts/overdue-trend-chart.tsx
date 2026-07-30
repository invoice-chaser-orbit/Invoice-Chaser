"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function OverdueTrendChart({
  data,
}: {
  data: { month: string; current: number; prior: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="overdueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 13 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 13 }}
            tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "1px solid #F3F4F6",
              boxShadow: "0 4px 12px rgba(17,24,39,0.08)",
              fontSize: 13,
            }}
            formatter={(v: number) => `$${v.toLocaleString()}`}
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="url(#overdueFill)"
            name="This period"
          />
          <Line
            type="monotone"
            dataKey="prior"
            stroke="#D1D5DB"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            name="Prior period"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
