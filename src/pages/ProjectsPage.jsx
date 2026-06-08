import { useState } from "react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/feedback/EmptyState";
import useCollection from "../hooks/useCollection";
import { useToasts } from "../contexts/ToastContext";

const blankProject = { name: "", stage: "Discovery", health: "Green", summary: "" };

function ProjectsPage() {
  const { items, save, destroy, error } = useCollection("projects");
  const [form, setForm] = useState(blankProject);
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
      setForm(blankProject);
      pushToast({ title: "Project saved", description: "Your project dashboard is up to date." });
    } catch (saveError) {
      pushToast({
        title: "Unable to save project",
        description: saveError.message || "Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await destroy(id);
    pushToast({ title: "Project removed", description: "The project has been deleted." });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Projects"
        title="Delivery portfolio dashboard"
        description="Track projects, health, stage, and context so your growth signals stay tied to real delivery work."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h3 className="text-xl font-semibold">Add or update project</h3>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Project name</span>
              <input
                required
                className="field"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Stage</span>
              <select
                className="field"
                value={form.stage}
                onChange={(event) => updateField("stage", event.target.value)}
              >
                <option>Discovery</option>
                <option>Build</option>
                <option>Launch</option>
                <option>Scale</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Health</span>
              <select
                className="field"
                value={form.health}
                onChange={(event) => updateField("health", event.target.value)}
              >
                <option>Green</option>
                <option>Yellow</option>
                <option>Red</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Summary</span>
              <textarea
                className="field min-h-28"
                value={form.summary}
                onChange={(event) => updateField("summary", event.target.value)}
              />
            </label>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving..." : "Save project"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold">Project portfolio</h3>
          {error ? <p className="mt-4 text-sm text-[var(--tone-error-text)]">{error}</p> : null}
          <div className="mt-6 space-y-4">
            {items.length ? (
              items.map((project) => (
                <article
                  key={project.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-3">
                        <h4 className="font-semibold">{project.name}</h4>
                        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                          {project.stage}
                        </span>
                        <span className="rounded-full bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                          {project.health}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {project.summary}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setForm(project)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(project.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="No projects yet"
                description="Create a project record to connect your delivery work with the rest of the dashboard."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ProjectsPage;
