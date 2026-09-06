import MapScraper from './MapScraper';

export default function ScraperPage() {
  return (
    <div className="mx-auto flex h-full max-w-[1400px] flex-col px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight">Map scraper</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Scan an area to pull clinic leads straight into the table.
        </p>
      </header>

      <div className="relative flex-1 overflow-hidden rounded-xl border bg-card shadow-xs">
        <MapScraper />
      </div>
    </div>
  );
}
