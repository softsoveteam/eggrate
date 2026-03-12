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

interface PriceChartProps {
  labels: string[];
  data: number[];
  min: number;
  max: number;
  title?: string;
}

export function PriceChart({ labels, data, min, max, title }: PriceChartProps) {
  const chartData = labels.map((label, i) => ({ name: label, value: data[i] ?? 0 }));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
      {title && (
        <h3 className="mb-4 text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          {title}
        </h3>
      )}
      <div className="h-64">
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
              {chartData.map((_, i) => (
                <Cell key={i} fill={i % 2 === 0 ? "#6366f1" : "#818cf8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
