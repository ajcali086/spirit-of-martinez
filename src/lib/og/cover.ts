import { grokOgIdentity } from "virtual:grok-og-identity";
import { sitePageMeta } from "./pageMeta";

export function coverPageMeta(path: string) {
  return sitePageMeta(path, grokOgIdentity.site.image || "/og.jpg");
}
