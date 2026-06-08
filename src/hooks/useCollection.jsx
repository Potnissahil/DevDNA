import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listRecords, removeRecord, upsertRecord } from "../services/dataService";

function useCollection(resource) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!user) return;

    setLoading(true);
    setError("");
    try {
      const data = await listRecords(resource, user.id);
      setItems(data);
    } catch (loadError) {
      setError(loadError.message || "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [resource, user?.id]);

  async function save(record) {
    const saved = await upsertRecord(resource, user.id, record);
    setItems((current) =>
      current.some((item) => item.id === saved.id)
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current]
    );
    return saved;
  }

  async function destroy(id) {
    await removeRecord(resource, id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return { items, loading, error, load, save, destroy };
}

export default useCollection;
