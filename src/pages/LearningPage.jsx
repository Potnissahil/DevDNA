import { useState } from "react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/feedback/EmptyState";
import useCollection from "../hooks/useCollection";
import { useToasts } from "../contexts/ToastContext";
import { formatDate } from "../utils/formatters";

const blankGoal = { title: "", status: "Planned", target_date: "", notes: "" };

function LearningPage() {
  const { items, save, destroy, error } = useCollection("learning_goals");
  const [form, setForm] = useState(blankGoal);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToasts();

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await save(form);
      setForm(blankGoal);
      pushToast({ title: "Goal saved", description: "Your learning roadmap has been updated." });
    } catch (saveError) {
      pushToast({
        title: "Unable to save goal",
        description: saveError.message || "Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await destroy(id);
    pushToast({ title: "Goal removed", description: "The item was deleted from your roadmap." });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Learning Progress"
        title="Goal planning dashboard"
        description="Define what to learn next, assign target dates, and track active vs completed execution."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Add or update goal</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Every goal should have a clear outcome, time boundary, and context for why it matters.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Goal title</span>
              <input
                required
                className="field"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Status</span>
              <select
                className="field"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                <option>Planned</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Target date</span>
              <input
                className="field"
                type="date"
                value={form.target_date}
                onChange={(event) => updateField("target_date", event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Notes</span>
              <textarea
                className="field min-h-28"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </label>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving..." : "Save learning goal"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Current roadmap</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            These items are stored in Supabase when configured, otherwise they persist locally in the browser.
          </p>
          {error ? <p className="mt-4 text-sm text-[var(--tone-error-text)]">{error}</p> : null}
          <div className="mt-6 space-y-4">
            {items.length ? (
              items.map((goal) => (
                <article
                  key={goal.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-semibold">{goal.title}</h4>
                        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                          {goal.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {goal.notes}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setForm(goal)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(goal.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[var(--text-secondary)]">
                    Target: {formatDate(goal.target_date)}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                title="No roadmap items yet"
                description="Create your first learning goal to start tracking execution."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LearningPage;
