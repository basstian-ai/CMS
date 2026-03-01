'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useState } from 'react';

import { AutoTranslatedText } from '@/components/ui/auto-translated-text';

type EventTickerItem = {
  id: string;
  title: string;
  titleSourceLocale: string;
  shouldAutoTranslateTitle: boolean;
  dateLabel: string;
  location: string;
  href: Route;
};

type EventTickerProps = {
  items: EventTickerItem[];
  locale: string;
};

export function EventTicker({ items, locale }: EventTickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setActiveIndex((current) =>
      current >= items.length ? Math.max(items.length - 1, 0) : current,
    );
  }, [items.length]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    mediaQuery.addEventListener('change', updatePreference);
    return () => {
      mediaQuery.removeEventListener('change', updatePreference);
    };
  }, []);

  useEffect(() => {
    if (items.length < 2 || isPaused || prefersReducedMotion) {
      return;
    }

    const tickerInterval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4500);

    return () => {
      window.clearInterval(tickerInterval);
    };
  }, [isPaused, items.length, prefersReducedMotion]);

  if (!items.length) {
    return null;
  }

  const activeItem = items[activeIndex];
  const canPauseRotation = items.length > 1 && !prefersReducedMotion;

  return (
    <section className="border-b border-[#e6ddcf] bg-[#f3ece1]">
      <div className="container-layout py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
          Kommende eventer
        </p>
        <p id="event-ticker-instructions" className="sr-only">
          Kommende eventer roterer automatisk. Bruk pauseknappen for å stoppe
          rotasjonen.
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div className="relative min-h-[2rem]">
            <div key={activeItem.id}>
              <Link
                href={activeItem.href}
                className="text-sm text-stone-700 transition hover:text-stone-950"
              >
                <span className="font-semibold">
                  <AutoTranslatedText
                    text={activeItem.title}
                    sourceLocale={activeItem.titleSourceLocale}
                    targetLocale={locale}
                    enabled={activeItem.shouldAutoTranslateTitle}
                  />
                </span>
                <span className="mx-2 text-stone-400">•</span>
                <span>{activeItem.dateLabel}</span>
                <span className="mx-2 text-stone-400">•</span>
                <span>{activeItem.location}</span>
              </Link>
            </div>
          </div>
          {canPauseRotation ? (
            <button
              type="button"
              aria-pressed={isPaused}
              aria-describedby="event-ticker-instructions"
              onClick={() => setIsPaused((current) => !current)}
              className="shrink-0 rounded-full border border-[#d9cfbf] bg-[#fffaf3] px-3 py-1 text-xs font-semibold text-stone-700 transition hover:bg-[#efe5d8]"
            >
              {isPaused ? 'Fortsett' : 'Pause'}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
