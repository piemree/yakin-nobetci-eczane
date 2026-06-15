"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getUniqueIlceler } from "@/lib/data";

interface DistrictPickerProps {
  citySlug: string;
  className?: string;
  selectClassName?: string;
  buttonClassName?: string;
}

export function DistrictPicker({
  citySlug,
  className = "",
  selectClassName = "",
  buttonClassName = "",
}: DistrictPickerProps) {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState("");

  const navigate = (slug: string) => {
    if (!slug) return;
    router.push(`/${citySlug}/${slug}`);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = event.target.value;
    setSelectedSlug(slug);
    navigate(slug);
  };

  const handleSearch = () => {
    navigate(selectedSlug);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <label className="sr-only" htmlFor="district-picker">
        İlçe seçin
      </label>
      <select
        id="district-picker"
        value={selectedSlug}
        onChange={handleChange}
        className={`min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none ring-emerald-500 focus:ring-2 ${selectClassName}`}
      >
        <option value="">İlçe seçin</option>
        {getUniqueIlceler(citySlug).map((ilce) => (
          <option key={ilce.id} value={ilce.slug}>
            {ilce.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSearch}
        disabled={!selectedSlug}
        className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-3.5 py-2.5 text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}
        aria-label="Seçili ilçeyi ara"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </div>
  );
}
