import Button from "../common/Button";
import { initialsFromName } from "../../utils/formatters";

function AccountPicker({ accounts, onContinue, onRemove, onUseAnother }) {
  if (!accounts.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Choose an account</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Continue with a saved account or sign in with another one.
        </p>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <article
            key={account.email}
            className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4"
          >
            <div className="flex items-center gap-4">
              {account.avatar ? (
                <img
                  src={account.avatar}
                  alt=""
                  className="h-12 w-12 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                  {initialsFromName(account.full_name || account.email)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--text-primary)]">
                  {account.full_name || "DevDNA user"}
                </p>
                <p className="truncate text-sm text-[var(--text-secondary)]">{account.email}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onContinue(account)}>
                Continue
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onRemove(account.email)}>
                Remove
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Button variant="secondary" className="w-full" onClick={onUseAnother}>
        Use another account
      </Button>
    </div>
  );
}

export default AccountPicker;
