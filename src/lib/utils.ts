import { formatDistanceToNow } from "date-fns";

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null,
  period: string | null
): string {
  if (!min) return "Salary not disclosed";
  const curr = currency || "SGD";
  const per = period || "year";
  const fmtNum = (n: number) => n.toLocaleString("en-US");
  if (max && max !== min) {
    return `${curr} ${fmtNum(min)} – ${fmtNum(max)} / ${per}`;
  }
  return `${curr} ${fmtNum(min)} / ${per}`;
}

export function employmentTypeLabel(type: string | null): string {
  const map: Record<string, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    intern: "Intern",
  };
  return map[type || ""] || type || "Full-time";
}

export function experienceLevelLabel(level: string | null): string {
  const map: Record<string, string> = {
    intern: "Intern",
    junior: "Junior",
    mid: "Mid-level",
    senior: "Senior",
    director: "Director+",
  };
  return map[level || ""] || level || "Mid-level";
}

export function employmentTypeJsonLd(type: string | null): string {
  const map: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    intern: "INTERN",
  };
  return map[type || ""] || "FULL_TIME";
}

export function countryToIso2(country: string | null): string {
  const map: Record<string, string> = {
    Singapore: "SG",
    "Hong Kong": "HK",
    Malaysia: "MY",
    Indonesia: "ID",
    Thailand: "TH",
    Vietnam: "VN",
    Philippines: "PH",
    India: "IN",
    China: "CN",
    Japan: "JP",
    "South Korea": "KR",
    Taiwan: "TW",
    Australia: "AU",
    "United Kingdom": "GB",
    "United States": "US",
    Canada: "CA",
    Germany: "DE",
    France: "FR",
    Switzerland: "CH",
    Netherlands: "NL",
    Ireland: "IE",
  };
  return map[country || ""] || country || "SG";
}
