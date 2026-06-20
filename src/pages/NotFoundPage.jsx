import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="max-w-xl p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Not Found
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
          This page is not available.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
          The page you&apos;re looking for could not be found. Return to the dashboard to continue.
        </p>
        <Button as={Link} to="/" className="mt-6">
          Back to dashboard
        </Button>
      </Card>
    </div>
  );
}

export default NotFoundPage;
