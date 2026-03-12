"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

interface LowHighChartProps {
  labels: string[];
  data: number[];
  min: number;
  max: number;
  title?: string;
}

export function LowHighChart({
  labels,
  data,
  min,
  max,
  title,
}: LowHighChartProps) {
  const chartData = labels.map((label, i) => ({ name: label, value: data[i] ?? 0 }));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
      {title && (
        <h3 className="mb-4 text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          {title}
        </h3>
      )}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#e4e4e7" }}
            />
            <YAxis
              domain={[min, max]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                backgroundColor: "white",
              }}
              formatter={(value) => [`₹${Number(value) || 0}`, "Price"]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              <Cell fill="#a5b4fc" />
              <Cell fill="#6366f1" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
