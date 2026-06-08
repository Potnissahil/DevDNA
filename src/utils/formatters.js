export function formatDate(dateString) {
  if (!dateString) {
    return "No date set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateString));
}

export function initialsFromName(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase())
    .join("");
}

export function calculateAverageProgress(skills) {
  if (!skills.length) {
    return 0;
  }

  const total = skills.reduce((sum, skill) => sum + Number(skill.progress || 0), 0);
  return Math.round(total / skills.length);
}
