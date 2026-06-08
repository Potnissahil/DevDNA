import { useState } from "react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import SectionHeader from "../components/common/SectionHeader";
import { useAuth } from "../contexts/AuthContext";
import { useToasts } from "../contexts/ToastContext";

function SettingsPage() {
  const { profile, updateProfile, authMode } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    role: profile?.role || "",
    github_username: profile?.github_username || "",
    bio: profile?.bio || ""
  });
  const [saving, setSaving] = useState(false);
  const { pushToast } = useToasts();

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      pushToast({
        title: "Profile updated",
        description: "Your identity and GitHub settings were saved."
      });
    } catch (error) {
      pushToast({
        title: "Unable to update profile",
        description: error.message || "Please try again."
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Profile"
        title="User settings"
        description="Manage your profile, GitHub integration target, and product identity settings."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <h3 className="text-xl font-semibold">Profile details</h3>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Full name</span>
              <input
                className="field"
                value={form.full_name}
                onChange={(event) => updateField("full_name", event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Role</span>
              <input
                className="field"
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">GitHub username</span>
              <input
                className="field"
                value={form.github_username}
                onChange={(event) => updateField("github_username", event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Bio</span>
              <textarea
                className="field min-h-28"
                value={form.bio}
                onChange={(event) => updateField("bio", event.target.value)}
              />
            </label>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold">Environment status</h3>
          <div className="mt-6 space-y-4">
            <EnvironmentRow label="Authentication mode" value={authMode} />
            <EnvironmentRow
              label="Session persistence"
              value="Enabled via Supabase auth or local browser storage"
            />
            <EnvironmentRow
              label="Theme persistence"
              value="Saved in localStorage and restored on refresh"
            />
            <EnvironmentRow
              label="GitHub analytics"
              value="Public API enabled with optional token for higher rate limits"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function EnvironmentRow({ label, value }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default SettingsPage;
