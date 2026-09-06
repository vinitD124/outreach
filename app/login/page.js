import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Zap } from 'lucide-react';
import { COOKIE_NAME, TTL_MS, createSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  async function handleLogin(formData) {
    'use server';

    const password = formData.get('password');
    const masterPassword = process.env.ADMIN_PASS;

    if (masterPassword && password === masterPassword) {
      // A signed value rather than a fixed string, so the cookie cannot be
      // typed by hand in devtools.
      const session = await createSession();
      if (!session) return;
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, session, {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: TTL_MS / 1000,
      });
      redirect('/admin');
    }
  }

  return (
    <div className="app-ground flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-lg shadow-brand/20">
            <Zap size={20} fill="currentColor" />
          </span>
          <h1 className="text-[19px] font-semibold tracking-tight">
            Outreach<span className="text-brand">HQ</span>
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Sign in to manage leads and demos.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form action={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Master password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                autoFocus
                autoComplete="current-password"
                className="text-[13px]"
              />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Sessions last seven days on this device.
        </p>
      </div>
    </div>
  );
}
