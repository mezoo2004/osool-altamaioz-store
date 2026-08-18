export default function ProductLoading() {
  return (
    <div className="container-page py-8 md:py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-[2rem] bg-surface-muted" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-surface-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-surface-muted" />
          <div className="h-32 w-full animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}
