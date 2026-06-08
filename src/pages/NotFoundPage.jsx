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
          This route doesn&apos;t exist.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
          Head back to the overview dashboard and continue exploring the workspace.
        </p>
        <Button as={Link} to="/" className="mt-6">
          Back to overview
        </Button>
      </Card>
    </div>
  );
}

export default NotFoundPage;
