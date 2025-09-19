const formatRelativeTime = (dateString) => {
  if (!dateString) return "Unknown time";

  const messageDate = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfMessageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  const time = messageDate.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const diffDays = (startOfToday - startOfMessageDay) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) {
    return time; // Bugün
  }
  if (diffDays === 1) {
    return `Dün`; // Dün
  }
  if (diffDays > 1 && diffDays < 7) {
    return `${messageDate.toLocaleDateString("tr-TR", {
      weekday: "long",
    })}`; // Hafta içi
  }

  return `${messageDate.toLocaleDateString("tr-TR")}`; // Daha eski
};

export default formatRelativeTime;
