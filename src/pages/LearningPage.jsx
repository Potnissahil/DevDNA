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
      pushToast({
        title: "Learning goal saved successfully.",
        description: "Your changes have been saved."
      });
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
    pushToast({
      title: "Learning goal removed successfully.",
      description: "The goal has been deleted."
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Learning goals"
        title="Learning goals"
        description="Plan what to learn next, set target dates, and track your progress."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Add or update goal</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Add a learning goal with a target date and short notes.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Goal title</span>
              <input
                required
                className="field"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="e.g. Learn React Router"
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
                placeholder="Describe your progress or learning plan"
              />
            </label>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving..." : "Save learning goal"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Current goals</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Your learning goals are saved to Supabase when available, or stored locally in demo mode.
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
                title="No learning goals yet"
                description="Add a goal to begin planning your growth."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LearningPage;
