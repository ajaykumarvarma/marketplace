import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  beforeSend(event) {
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.stacktrace) {
        error.stacktrace.frames = error.stacktrace.frames.filter(
          (frame) => !frame.filename?.includes("node_modules")
        );
      }
    }
    return event;
  },
});