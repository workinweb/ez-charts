import { NotFoundContent } from "@/components/error-pages";

export default function AppNotFound() {
  return (
    <NotFoundContent
      variant="app"
      homeHref="/"
      homeLabel="Go to Dashboard"
      subtitle="This chart, slide, or page doesn't exist or has been moved."
    />
  );
}
