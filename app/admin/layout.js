import Link from 'next/link';
import { LogOut, Zap, ExternalLink } from 'lucide-react';
import { signOut } from './actions';
import { SidebarNav } from '@/components/admin/SidebarNav';
import { Button } from '@/components/ui/button';
import { TEMPLATE_LIST } from '@/lib/templates';

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="px-4 py-5">
          <Link href="/admin" className="group flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground shadow-sm transition-transform group-hover:scale-105">
              <Zap size={15} fill="currentColor" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Outreach<span className="text-brand">HQ</span>
            </span>
          </Link>
        </div>

        <div className="px-3">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            Workspace
          </p>
          <SidebarNav />
        </div>

        {/* Templates are a first-class concept now, so they get somewhere to
            be looked at rather than being buried in a table cell. */}
        <div className="mt-6 px-3">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            Demo templates
          </p>
          <div className="flex flex-col gap-0.5">
            {TEMPLATE_LIST.map((t) => (
              <a
                key={t.id}
                href={`/admin/preview/${t.id}`}
                target="_blank"
                rel="noopener"
                title={t.blurb}
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-brand" />
                <span className="truncate">{t.label}</span>
                <ExternalLink
                  size={12}
                  className="ml-auto shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground"
                />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t p-3">
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-[13px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={16} />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="app-ground relative flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
