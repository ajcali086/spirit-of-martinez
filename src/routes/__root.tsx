import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { BookAudioProvider } from "@/components/layout/BookAudio";
import appCss from "../styles.css?url";

const APP_NAME = "The Spirit of Martinez";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "What a Family Kept — the Calicura family of Martinez, California, and the B-17 Flying Fortress that carried their town’s name over Europe in 1945.",
      },
      { name: "theme-color", content: "#141210" },
    ],
    links: [
      {
        rel: "preload",
        href: "/fonts/cormorant-garamond-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/cormorant-garamond-latin-italic.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/outfit-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-ink text-paper font-sans">
        <PreviewHostBridge />
        <AuthProvider>
          <BookAudioProvider>
            <Outlet />
          </BookAudioProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
