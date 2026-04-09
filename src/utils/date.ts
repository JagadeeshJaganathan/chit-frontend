export const formatMonthYearByLanguage = (
  date: Date,
  language: "en" | "ta",
) =>
  new Intl.DateTimeFormat(language === "ta" ? "ta-IN" : "en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
