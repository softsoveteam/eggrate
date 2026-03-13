"use client";

import { useState } from "react";
import Link from "next/link";
import type { RateRow } from "@/types/egg";

const INITIAL_ROWS = 5;

function toSlug(str: string | undefined | null): string {
  if (str == null || typeof str !== "string") return "";
  return str
    .trim()
    .replace(/[^a-zA-Z0-9/\s.-]+/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function RateTableWithLoadMore({
  rateList,
  isDate,
  dateLabel,
  cityLabel,
  basePath = "",
  tableHeaders = { piece: "Piece", tray: "Tray", hundred: "100 pcs", peti: "Peti" },
  loadMoreText = "Load more (%d more)",
  cityLinkSuffix = "-egg-rate",
}: {
  rateList: RateRow[];
  isDate: boolean;
  dateLabel: string;
  cityLabel: string;
  basePath?: string;
  tableHeaders?: { piece: string; tray: string; hundred: string; peti: string };
  loadMoreText?: string;
  /** Suffix for city links when isDate is false (e.g. "-egg-rate-today"). Default "-egg-rate". */
  cityLinkSuffix?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? rateList : rateList.slice(0, INITIAL_ROWS);
  const hasMore = rateList.length > INITIAL_ROWS;
  const remaining = rateList.length - INITIAL_ROWS;
  const prefix = basePath ? `/${basePath}` : "";
  const loadMoreLabel = loadMoreText.replace(/%d/g, String(remaining));

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow dark:border-zinc-700 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              <th className="px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                {isDate ? cityLabel : dateLabel}
              </th>
              <th className="px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">{tableHeaders.piece}</th>
              <th className="px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">{tableHeaders.tray}</th>
              <th className="px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">{tableHeaders.hundred}</th>
              <th className="px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">{tableHeaders.peti}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => {
              const keyVal = row.date ?? row.city ?? "";
              const href = isDate
                ? `${prefix}/${toSlug(keyVal)}-egg-rate-today`
                : i === 0
                  ? prefix || "/"
                  : `${prefix}/${toSlug(keyVal)}${cityLinkSuffix}`;
              return (
                <tr
                  key={i}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <th className="px-4 py-3 font-medium">
                    <Link
                      href={href}
                      className="text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {(keyVal ?? "").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">{row.piece}</td>
                  <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">{row.tray}</td>
                  <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">{row.hundred_pcs}</td>
                  <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">{row.peti}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {hasMore && !showAll && (
        <div className="border-t border-zinc-100 p-3 text-center dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {loadMoreLabel}
          </button>
        </div>
      )}
    </div>
  );
}
