import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { legacyPaths } from "@/data/legacy";

export const Route = createFileRoute("/$")({
  beforeLoad: ({ params }) => {
    const key = (params._splat ?? "").replace(/\/+$/, "").toLowerCase();
    const dest = legacyPaths[key];
    if (dest) {
      throw redirect({ href: dest, statusCode: 301 });
    }
    throw notFound();
  },
});
