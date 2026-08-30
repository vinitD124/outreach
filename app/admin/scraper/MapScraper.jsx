'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LeafletMap = dynamic(
  () => import('./LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="animate-spin" size={32} />
          <p className="font-medium">Loading Map Engine...</p>
        </div>
      </div>
    )
  }
);

export default function MapScraper() {
  return <LeafletMap />;
}
