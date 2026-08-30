import MapScraper from './MapScraper';

export default function ScraperPage() {
  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 sm:p-10 font-sans">
      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Google Places Scraper</h1>
          <p className="text-slate-500 font-medium">Scan areas to instantly pull highly-targeted clinic leads and generate demos.</p>
        </div>
        
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          <MapScraper />
        </div>
      </div>
    </div>
  );
}
