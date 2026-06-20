import { calculateAverageProgress } from "./formatters";

const GOAL_STATUS_ORDER = ["Completed", "In Progress", "Pending"];
const PROJECT_HEALTH_ORDER = ["Healthy", "Warning", "Critical"];

const GOAL_STATUS_LABELS = {
  Completed: "Completed",
  "In Progress": "In Progress",
  Planned: "Pending"
};

const PROJECT_HEALTH_LABELS = {
  Green: "Healthy",
  Yellow: "Warning",
  Red: "Critical"
};

export function buildSkillsProgressData(skills = []) {
  return [...skills]
    .map((skill) => ({
      name: skill.name,
      progress: Number(skill.progress || 0),
      level: skill.level || "Beginner"
    }))
    .sort((left, right) => right.progress - left.progress);
}

export function buildGoalStatusData(goals = []) {
  const totals = GOAL_STATUS_ORDER.reduce((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, {});

  goals.forEach((goal) => {
    const label = GOAL_STATUS_LABELS[goal.status] || "Pending";
    totals[label] += 1;
  });

  return GOAL_STATUS_ORDER.map((status) => ({
    name: status,
    value: totals[status]
  }));
}

export function buildProjectHealthData(projects = []) {
  const totals = PROJECT_HEALTH_ORDER.reduce((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, {});

  projects.forEach((project) => {
    const label = PROJECT_HEALTH_LABELS[project.health] || "Warning";
    totals[label] += 1;
  });

  return PROJECT_HEALTH_ORDER.map((status) => ({
    name: status,
    value: totals[status]
  }));
}

export function buildOverallProgressData(skills = [], goals = [], projects = [], githubStats = null) {
  const completedGoals = goals.filter((goal) => goal.status === "Completed").length;
  const healthyProjects = projects.filter((project) => project.health === "Green").length;
  const githubActiveDays = githubStats?.activeDays ?? 0;

  return [
    {
      name: "Skills",
      value: calculateAverageProgress(skills),
      detail: "Average skill progress"
    },
    {
      name: "Goals",
      value: goals.length ? Math.round((completedGoals / goals.length) * 100) : 0,
      detail: "Goals completed"
    },
    {
      name: "Projects",
      value: projects.length ? Math.round((healthyProjects / projects.length) * 100) : 0,
      detail: "Healthy projects"
    },
    {
      name: "GitHub",
      value: Math.min(Math.round((githubActiveDays / 30) * 100), 100),
      detail: "Recent active days"
    }
  ];
}

export function sumChartValues(items = []) {
  return items.reduce((sum, item) => sum + Number(item.value || 0), 0);
}
