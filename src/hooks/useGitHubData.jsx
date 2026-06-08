import { useEffect, useState } from "react";
import { fetchGitHubSnapshot } from "../services/githubService";

function useGitHubData(username) {
  const [data, setData] = useState({
    profile: null,
    repositories: [],
    events: [],
    languageBreakdown: [],
    stats: null
  });
  const [loading, setLoading] = useState(Boolean(username));
  const [error, setError] = useState("");

  async function load() {
    if (!username) {
      setLoading(false);
      setData({
        profile: null,
        repositories: [],
        events: [],
        languageBreakdown: [],
        stats: null
      });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const snapshot = await fetchGitHubSnapshot(username);
      setData(snapshot);
    } catch (loadError) {
      setError(loadError.message || "Unable to load GitHub data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [username]);

  return { ...data, loading, error, reload: load };
}

export default useGitHubData;
