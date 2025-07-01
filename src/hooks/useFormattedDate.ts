export const aetherFormatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "Invalid Date";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const formattedTime = `${hours}:${minutes} ${ampm}`;
  return `${day}-${month}-${year} ${formattedTime}`;
};
