const APP_KEY = "devdna-app-store";

const seed = {
  profile: {
    full_name: "Ava Johnson",
    role: "Senior Frontend Engineer",
    github_username: "octocat",
    bio: "Building resilient product experiences and leveling up system design."
  },
  skills: [
    {
      id: "skill-1",
      name: "React Architecture",
      level: "Advanced",
      progress: 82,
      focus: "Creating scalable feature boundaries and reusable design primitives."
    },
    {
      id: "skill-2",
      name: "System Design",
      level: "Intermediate",
      progress: 64,
      focus: "Improving distributed thinking, tradeoff analysis, and resilience patterns."
    }
  ],
  learning_goals: [
    {
      id: "goal-1",
      title: "Ship the GitHub activity workspace",
      status: "In Progress",
      target_date: "2026-06-20",
      notes: "Focus on repository analytics, commit health, and architecture readiness."
    }
  ],
  projects: [
    {
      id: "project-1",
      name: "DevDNA Project Dashboard",
      stage: "Build",
      health: "Green",
      summary: "Core application with authentication, dashboards, architecture review, and Supabase."
    }
  ]
};

function readStore() {
  const raw = window.localStorage.getItem(APP_KEY);
  if (raw) {
    return JSON.parse(raw);
  }

  window.localStorage.setItem(APP_KEY, JSON.stringify(seed));
  return seed;
}

function writeStore(data) {
  window.localStorage.setItem(APP_KEY, JSON.stringify(data));
  return data;
}

export function getProfile() {
  return readStore().profile;
}

export function saveProfile(profile) {
  const next = { ...readStore(), profile };
  writeStore(next);
  return profile;
}

export function listCollection(key) {
  return readStore()[key] || [];
}

export function saveRecord(key, record) {
  const store = readStore();
  const collection = store[key] || [];
  const nextRecord = { ...record, id: record.id || crypto.randomUUID() };
  const nextCollection = collection.some((item) => item.id === nextRecord.id)
    ? collection.map((item) => (item.id === nextRecord.id ? nextRecord : item))
    : [nextRecord, ...collection];
  writeStore({ ...store, [key]: nextCollection });
  return nextRecord;
}

export function deleteRecord(key, id) {
  const store = readStore();
  writeStore({ ...store, [key]: (store[key] || []).filter((item) => item.id !== id) });
}
