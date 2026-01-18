export default function AdminPage() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Velkommen!</h2>
      <p className="text-sm text-slate-300">
        Dette er startpunktet for admin. Neste steg er å koble til Supabase Auth
        og sette opp CRUD-visninger for innhold.
      </p>
    </div>
  );
}
