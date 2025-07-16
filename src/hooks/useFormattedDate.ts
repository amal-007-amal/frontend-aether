export const aetherFormatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "Invalid Date";

  // Add 5 hours 30 minutes for IST
  date.setMinutes(date.getMinutes() + 330);

  const day = String(date.getDate());
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const formattedTime = `${hours}:${minutes} ${ampm}`;
  return `${month} ${day}, ${year}, ${formattedTime}`;
};



export const aetherFormaISOLocaltDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "Invalid Date";

  const day = String(date.getDate());
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const formattedTime = `${hours}:${minutes} ${ampm}`;
  return `${month} ${day}, ${year}, ${formattedTime}`;
};
