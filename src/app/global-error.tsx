"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#ffffff", color: "#080808" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: "28rem", textAlign: "center" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#ea5a2d", margin: 0 }}>Error</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: "1rem" }}>حدث خطأ غير متوقع</h1>
            <p style={{ fontSize: "0.875rem", color: "#6d6f72", marginTop: "0.75rem" }}>Unexpected error — Osool Altamaioz</p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "2rem",
                height: "2.75rem",
                padding: "0 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#ea5a2d",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              إعادة المحاولة / Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
