export const generateChitMonths = (startDate: string, duration: number) => {
  const months = [];
  const start = new Date(startDate);

  for (let i = 0; i < duration; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);

    const monthName = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();

    months.push({
      label: `${monthName} ${year} - M${i + 1}`,
      value: i + 1,
    });
  }

  return months;
};
