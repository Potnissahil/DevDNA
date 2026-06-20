import Card from "../components/common/Card";
import SectionHeader from "../components/common/SectionHeader";
import StatusPill from "../components/common/StatusPill";
import { useAuth } from "../contexts/AuthContext";
import { architectureSections } from "../data/architectureContent";

function ArchitecturePage() {
  const { authMode } = useAuth();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Architecture Review"
        title="Application architecture"
        description="A structured view of the current DevDNA architecture across the frontend, backend, data, and security layers."
      />

      <Card className="overflow-hidden p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">System overview</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              This diagram shows how the routed React client, state providers, service
              layer, Supabase backend, and GitHub integration fit together.
            </p>
          </div>
          <StatusPill tone={authMode === "supabase" ? "success" : "warning"}>
            {authMode === "supabase" ? "Supabase connected" : "Demo mode with local storage"}
          </StatusPill>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <DiagramNode
            title="React Client"
            points={["Lazy loaded pages", "Protected routes", "Theme and auth contexts"]}
          />
          <DiagramNode
            title="Service Layer"
            points={["Auth and profile services", "CRUD repository abstraction", "GitHub analytics aggregation"]}
          />
          <DiagramNode
            title="Supabase + GitHub"
            points={["Auth and Postgres data", "Row-level security", "Repository and event APIs"]}
          />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        {architectureSections.map((section) => (
          <Card key={section.title} className="p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {section.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {section.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DiagramNode({ title, points }) {
  return (
    <div className="rounded-[30px] border border-[var(--border)] bg-[var(--panel-muted)]/45 p-5">
      <h4 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h4>
      <div className="mt-4 space-y-3">
        {points.map((point) => (
          <div
            key={point}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text-secondary)]"
          >
            {point}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ArchitecturePage;
