'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Users, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The nav needs to know which page it is on, which makes it a client
 * component. Kept separate so the layout around it can stay a server
 * component and go on calling the signOut action directly.
 *
 * The items live here rather than being passed in: an icon is a React
 * component, and a component cannot cross the server/client boundary as
 * a prop - Next refuses to serialise it.
 */
const NAV = [
  { href: '/admin', label: 'Leads', icon: Users, exact: true },
  { href: '/admin/scraper', label: 'Map scraper', icon: Map },
  { href: '/admin/import', label: 'Import', icon: Upload },
];

export function SidebarNav({ items = NAV }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active =
          item.exact ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
            )}
          >
            {/* the active marker sits in the gutter rather than moving the
                label, so nothing shifts as you navigate */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand transition-all',
                active ? 'opacity-100' : 'opacity-0'
              )}
            />
            <item.icon
              size={16}
              className={cn(
                'shrink-0 transition-colors',
                active ? 'text-brand' : 'text-muted-foreground/70 group-hover:text-foreground'
              )}
            />
            <span className="truncate">{item.label}</span>
            {item.badge != null && (
              <span className="nums ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
