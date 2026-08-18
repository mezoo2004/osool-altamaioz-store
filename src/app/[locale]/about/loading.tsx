export default function ContentLoading() {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
        <div className="h-8 w-64 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-surface-muted" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
