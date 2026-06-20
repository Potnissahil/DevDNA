import { useState } from "react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/feedback/EmptyState";
import useCollection from "../hooks/useCollection";
import { useToasts } from "../contexts/ToastContext";

const blankSkill = { name: "", level: "Beginner", progress: 50, focus: "" };

function SkillsPage() {
  const { items, save, destroy, error } = useCollection("skills");
  const [form, setForm] = useState(blankSkill);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToasts();

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await save({ ...form, progress: Number(form.progress) });
      setForm(blankSkill);
      pushToast({
        title: "Skill saved successfully.",
        description: "Your changes have been saved."
      });
    } catch (saveError) {
      pushToast({
        title: "Unable to save skill",
        description: saveError.message || "Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await destroy(id);
    pushToast({
      title: "Skill removed successfully.",
      description: "The skill has been deleted."
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Skills"
        title="Skills"
        description="Track your skill levels, current focus areas, and progress."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h3 className="text-xl font-semibold">Add or update skill</h3>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Skill name</span>
              <input
                required
                className="field"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. React"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Skill level</span>
              <select
                className="field"
                value={form.level}
                onChange={(event) => updateField("level", event.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Progress percentage</span>
              <input
                className="field"
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={(event) => updateField("progress", event.target.value)}
                placeholder="e.g. 70"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Current focus</span>
              <textarea
                className="field min-h-28"
                value={form.focus}
                onChange={(event) => updateField("focus", event.target.value)}
                placeholder="e.g. Building small projects and practicing hooks"
              />
            </label>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving..." : "Save skill"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold">Skill portfolio</h3>
          {error ? <p className="mt-4 text-sm text-[var(--tone-error-text)]">{error}</p> : null}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {items.length ? (
              items.map((skill) => (
                <article
                  key={skill.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{skill.name}</h4>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {skill.level}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      {skill.progress}%
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                    {skill.focus}
                  </p>
                  <div className="mt-4 h-3 rounded-full bg-[var(--panel-muted)]">
                    <div
                      className="h-3 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setForm(skill)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(skill.id)}>
                      Delete
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="No skills added yet"
                description="Add your first skill to start tracking progress."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SkillsPage;
