import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/cyberbacker-university")({
  head: () => ({ meta: [
    { title: "Cyberbacker University — Cyberbacker" },
    { name: "description", content: "Cyberbacker University learning workspace." },
    { property: "og:title", content: "Cyberbacker University — Cyberbacker" },
    { property: "og:description", content: "The Cyberbacker University learning workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <PageHeader title="Cyberbacker University" />,
});