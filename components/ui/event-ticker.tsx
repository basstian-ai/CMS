'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useState } from 'react';

type EventTickerItem = {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  href: Route;
};

type EventTickerProps = {
  items: EventTickerItem[];
};

export function EventTicker({ items }: EventTickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) {
      return;
    }

    const tickerInterval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4500);

    return () => {
      window.clearInterval(tickerInterval);
    };
  }, [items.length]);

  if (!items.length) {
    return null;
  }

  const activeItem = items[activeIndex];

  return (
    <section className="border-b border-[#e6ddcf] bg-[#f3ece1]">
      <div className="container-layout py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
          Kommende eventer
        </p>
        <div className="relative mt-1 min-h-[2rem]">
          <div key={activeItem.id}>
            <Link
              href={activeItem.href}
              className="text-sm text-stone-700 transition hover:text-stone-950"
            >
              <span className="font-semibold">{activeItem.title}</span>
              <span className="mx-2 text-stone-400">•</span>
              <span>{activeItem.dateLabel}</span>
              <span className="mx-2 text-stone-400">•</span>
              <span>{activeItem.location}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
