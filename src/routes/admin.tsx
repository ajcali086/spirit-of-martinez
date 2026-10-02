import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /admin opens the curator's workbench (Sveltia CMS), a static page in
 * public/admin/ that runs on its own, outside the site's app. Without this
 * route the catch-all ($.tsx) would answer /admin with a 404.
 */
export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    throw redirect({ href: "/admin/index.html", reloadDocument: true });
  },
});
