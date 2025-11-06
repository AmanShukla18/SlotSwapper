'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get('email') || '').trim(),
      password: String(fd.get('password') || ''),
    };

    try {
      console.log('[LOGIN] Sending request...');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('[LOGIN] Failed', data);
        setError(data?.message || 'Login failed');
        setLoading(false);
        return;
      }

      console.log('[LOGIN] Success! Waiting for cookie sync...');
      await new Promise((res) => setTimeout(res, 300)); // give cookie time to persist

      console.log('[LOGIN] Redirecting to /dashboard...');
      router.replace('/dashboard'); // clean redirect inside app
    } catch (err: any) {
      console.error('[LOGIN] Network error:', err);
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email below to log in to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" required />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
