'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { updateMediaMetadata } from '@/app/admin/media/actions';

type MediaItem = {
  id: string;
  bucket: string;
  path: string;
  alt: { no?: string | null; en?: string | null } | null;
  caption: { no?: string | null; en?: string | null } | null;
  publicUrl: string;
};

export function MediaPicker({
  items,
  inputName,
  initialValue,
  label = 'Velg bilde',
}: {
  items: MediaItem[];
  inputName: string;
  initialValue?: string | null;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState(initialValue ?? '');

  const selectedItem = useMemo(
    () => items.find((item) => item.path === selectedPath) ?? null,
    [items, selectedPath],
  );

  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return items;
    }

    return items.filter((item) => {
      const haystack = `${item.bucket}/${item.path} ${item.alt?.no ?? ''} ${item.caption?.no ?? ''}`;
      return haystack.toLowerCase().includes(trimmed);
    });
  }, [items, query]);

  return (
    <div className="space-y-3">
      <input type="hidden" name={inputName} value={selectedPath} readOnly />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:border-slate-500"
        >
          {label}
        </button>
        {selectedPath ? (
          <button
            type="button"
            onClick={() => setSelectedPath('')}
            className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500"
          >
            Fjern valg
          </button>
        ) : null}
      </div>

      <p className="text-sm text-slate-300">
        {selectedPath ? `Valgt: ${selectedPath}` : 'Ingen fil valgt'}
      </p>

      {selectedItem ? (
        <p className="text-xs text-slate-400">
          Alt: {selectedItem.alt?.no || '-'} · Bildetekst:{' '}
          {selectedItem.caption?.no || '-'}
        </p>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-4">
              <h3 className="text-lg font-semibold text-slate-100">
                Media picker
              </h3>
              <div className="flex items-center gap-2">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Søk i sti eller metadata"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
                >
                  Lukk
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              <div className="grid gap-4 md:grid-cols-2">
                {filteredItems.map((item) => (
                  <article
                    key={item.id}
                    className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    {item.bucket === 'images' ? (
                      <Image
                        src={item.publicUrl}
                        alt={item.alt?.no ?? item.path}
                        width={640}
                        height={320}
                        className="h-40 w-full rounded-lg object-cover"
                        unoptimized
                      />
                    ) : null}

                    <div>
                      <p className="font-medium text-slate-100">{item.path}</p>
                      <p className="text-xs text-slate-400">
                        Bucket: {item.bucket}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPath(item.path);
                          setIsOpen(false);
                        }}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                      >
                        Velg
                      </button>
                      <a
                        href={item.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-brand-400 hover:text-brand-300"
                      >
                        Åpne fil
                      </a>
                    </div>

                    <form
                      action={updateMediaMetadata.bind(null, item.id)}
                      className="space-y-2"
                    >
                      <label className="block space-y-1 text-xs text-slate-300">
                        Alt-tekst (NO)
                        <input
                          name="alt"
                          defaultValue={item.alt?.no ?? ''}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                        />
                      </label>
                      <label className="block space-y-1 text-xs text-slate-300">
                        Bildetekst (NO)
                        <input
                          name="caption"
                          defaultValue={item.caption?.no ?? ''}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                        />
                      </label>
                      <button
                        type="submit"
                        className="rounded-full border border-slate-600 px-3 py-1.5 text-xs text-slate-100"
                      >
                        Lagre metadata
                      </button>
                    </form>
                  </article>
                ))}
              </div>

              {!filteredItems.length ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  Ingen media funnet.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
