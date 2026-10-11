import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Cyberbacker" }, { name: "description", content: "Sign in to Cyberbacker." }, { property: "og:title", content: "Sign in — Cyberbacker" }, { property: "og:description", content: "Sign in to the Cyberbacker platform." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <Navigate to="/" replace />,
});