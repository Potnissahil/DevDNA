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

export function generateRecommendations(skills = [], goals = [], github = null) {
  const recommendations = [];

  if (github?.repositoryInsights) {
    const insights = github.repositoryInsights;
    if (
      insights.presentationRate !== null &&
      insights.presentationRate < 100 &&
      insights.repoCount - insights.presentedCount >= 1
    ) {
      const count = insights.repoCount - insights.presentedCount;
      recommendations.push({
        id: "repo-presentation",
        title: "Improve repository presentation",
        description: `${count} of your ${insights.repoCount} ${
          insights.repoCount === 1 ? "repository is" : "repositories are"
        } missing a description or homepage. Adding short descriptions makes your projects easier to find and understand.`,
        priority: "attention"
      });
    }
  }

  if (skills.length > 0) {
    const lowProgress = skills.filter(
      (skill) => Number(skill.progress || 0) < 25
    );
    if (lowProgress.length >= 1) {
      const names = lowProgress
        .map((s) => `${s.name} (${Number(s.progress || 0)}%)`)
        .join(", ");
      recommendations.push({
        id: "skills-low-progress",
        title: "Review low-progress skills",
        description: `${lowProgress.length} ${
          lowProgress.length === 1 ? "skill is" : "skills are"
        } below 25% progress: ${names}. Consider whether to invest more time or remove them from your tracking.`,
        priority: "attention"
      });
    }
  }

  if (goals.length >= 3) {
    const plannedCount = goals.filter((g) => g.status === "Planned").length;
    const inProgressCount = goals.filter((g) => g.status === "In Progress").length;
    if (plannedCount >= 3 && inProgressCount === 0) {
      recommendations.push({
        id: "goal-pipeline",
        title: "Start working on your learning goals",
        description: `${plannedCount} of ${goals.length} ${
          goals.length === 1 ? "goal is" : "goals are"
        } still planned with none currently in progress. Consider picking one goal to start working on.`,
        priority: "attention"
      });
    }
  }

  return recommendations;
}

export function sumChartValues(items = []) {
  return items.reduce((sum, item) => sum + Number(item.value || 0), 0);
}
