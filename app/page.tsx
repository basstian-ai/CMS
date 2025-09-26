import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center space-y-6 text-center">
      <h1 className="text-3xl font-semibold">Starter Commerce CMS</h1>
      <p className="max-w-xl text-muted-foreground">
        Minimal starter showing a unified admin dashboard, content API, and commerce primitives built on Supabase.
      </p>
      <div className="flex gap-4">
        <Link className="rounded bg-brand px-4 py-2 font-medium text-white" href="/(auth)/login">
          Login
        </Link>
        <Link className="rounded border border-brand px-4 py-2 font-medium text-brand" href="/(admin)/dashboard">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
