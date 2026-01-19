export default function AdminLoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container-layout flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-900 bg-slate-900/50 p-8 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
