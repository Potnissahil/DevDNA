import { useState } from "react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import SectionHeader from "../components/common/SectionHeader";
import { useAuth } from "../contexts/AuthContext";
import { useToasts } from "../contexts/ToastContext";
import { validateGitHubUsername } from "../utils/githubUsername";

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

    const githubValidation = validateGitHubUsername(form.github_username);
    if (!githubValidation.valid) {
      pushToast({
        title: "Invalid GitHub username",
        description: githubValidation.error
      });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        ...form,
        github_username: githubValidation.username
      });
      pushToast({
        title: "Profile updated successfully.",
        description: "Your changes have been saved."
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
        title="Profile settings"
        description="Update your personal details and GitHub username."
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
                placeholder="e.g. Aisha Sharma"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Your role</span>
              <input
                className="field"
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                placeholder="e.g. Frontend developer"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">GitHub username</span>
              <input
                className="field"
                value={form.github_username}
                onChange={(event) => updateField("github_username", event.target.value)}
                placeholder="e.g. octocat"
                autoComplete="username"
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--text-secondary)]">
                Use letters, numbers, and hyphens only. Leave this blank to remove GitHub activity.
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Bio</span>
              <textarea
                className="field min-h-28"
                value={form.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                placeholder="Write a short introduction about yourself and your interests."
              />
            </label>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold">App status</h3>
          <div className="mt-6 space-y-4">
            <EnvironmentRow label="Sign-in method" value={authMode} />
            <EnvironmentRow
              label="Session storage"
              value="Saved using Supabase authentication or local browser storage"
            />
            <EnvironmentRow
              label="Theme preference"
              value="Saved in local storage and restored on refresh"
            />
            <EnvironmentRow
              label="GitHub connection"
              value="Uses public GitHub data from the username saved in your profile"
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
