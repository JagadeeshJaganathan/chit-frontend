export const DEFAULT_START_MONTH = "2025-12";

export const getMonthStartDate = (value?: string) => {
  const normalizedValue = value || `${DEFAULT_START_MONTH}-01`;
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date(`${DEFAULT_START_MONTH}-01`);
  }

  return parsedDate;
};

export const formatMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);

export const getMonthNumberForDate = (startDateValue?: string, duration = 10) => {
  const startDate = getMonthStartDate(startDateValue);
  const now = new Date();
  const monthDifference =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  return Math.min(Math.max(monthDifference + 1, 1), duration);
};

export const getMonthOptions = (startDateValue?: string, duration = 10) =>
  Array.from({ length: duration }, (_, i) => {
    const monthNumber = i + 1;
    const optionDate = new Date(getMonthStartDate(startDateValue));
    optionDate.setMonth(optionDate.getMonth() + i);

    return {
      value: monthNumber,
      date: optionDate,
      label: `M${monthNumber} - ${formatMonthLabel(optionDate)}`,
    };
  });
