import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <nav className="flex items-center gap-4 text-sm text-slate-600">
        <Link href="/(admin)/dashboard" className="font-medium text-slate-900">
          Dashboard
        </Link>
        <Link href="/(admin)/content/pages">Pages</Link>
        <Link href="/(admin)/pim/products">Products</Link>
        <Link href="/(admin)/pim/categories">Categories</Link>
        <Link href="/(admin)/orders">Orders</Link>
      </nav>
      {children}
    </div>
  );
}
