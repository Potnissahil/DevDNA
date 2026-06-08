import { useEffect, useState } from "react";
import { fetchGitHubSnapshot } from "../services/githubService";
import { normalizeGitHubUsername, validateGitHubUsername } from "../utils/githubUsername";

const emptyData = {
  profile: null,
  repositories: [],
  events: [],
  languageBreakdown: [],
  stats: null
};

function useGitHubData(username) {
  const normalizedUsername = normalizeGitHubUsername(username);
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(Boolean(normalizedUsername));
  const [error, setError] = useState("");

  async function load() {
    if (!normalizedUsername) {
      setLoading(false);
      setError("");
      setData(emptyData);
      return;
    }

    const validation = validateGitHubUsername(normalizedUsername);
    if (!validation.valid) {
      setLoading(false);
      setError(validation.error);
      setData(emptyData);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const snapshot = await fetchGitHubSnapshot(validation.username);
      setData(snapshot);
    } catch (loadError) {
      setError(loadError.message || "Unable to load GitHub data.");
      setData(emptyData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [normalizedUsername]);

  return { ...data, loading, error, reload: load };
}

export default useGitHubData;
