import { NotFoundContent } from "@/components/error-pages";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <NotFoundContent
        variant="root"
        homeHref="/"
        homeLabel="Go to Dashboard"
        subtitle="The page you're looking for doesn't exist or has been moved."
      />
    </div>
  );
}
