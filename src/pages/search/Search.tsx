import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';
import { Search as SearchIcon, Calendar, CheckSquare, CreditCard, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/queries/useSearchQueries';

// ── Debounce utility ─────────────────────────────────────────
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Skeleton row ─────────────────────────────────────────────
function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      ))}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

// ── Result row ───────────────────────────────────────────────
function ResultRow({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl
        bg-white dark:bg-neutral-900
        border border-neutral-100 dark:border-neutral-800
        hover:border-neutral-200 dark:hover:border-neutral-700
        text-left transition-[border-color] duration-150 group"
    >
      <div className="min-w-0">
        <p className="text-sm text-neutral-900 dark:text-neutral-100 truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '');
  const debouncedQ = useDebounced(inputValue, 300);

  // Keep URL in sync (but don't push history on every keypress — replace instead)
  useEffect(() => {
    if (debouncedQ) {
      setSearchParams({ q: debouncedQ }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQ, setSearchParams]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data, isLoading } = useSearch(debouncedQ);

  const hasResults =
    (data?.meetings?.length ?? 0) > 0 ||
    (data?.tasks?.length ?? 0) > 0 ||
    (data?.cards?.length ?? 0) > 0 ||
    (data?.contacts?.length ?? 0) > 0;

  const showEmpty = debouncedQ.length >= 2 && !isLoading && !hasResults;

  return (
    <PageMotion>
      <div className="max-w-2xl mx-auto pb-12">
        {/* Search input */}
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search meetings, tasks, cards, contacts…"
            className="w-full pl-11 pr-4 py-3 text-sm rounded-xl
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-800
              text-neutral-900 dark:text-neutral-100
              placeholder-neutral-400 dark:placeholder-neutral-500
              focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600
              transition-shadow"
          />
        </div>

        {/* Prompt before typing */}
        {debouncedQ.length < 2 && (
          <div className="text-center py-16">
            <SearchIcon className="w-8 h-8 text-neutral-200 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Type at least 2 characters to search
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && debouncedQ.length >= 2 && (
          <div className="space-y-8">
            <SkeletonRows count={2} />
            <SkeletonRows count={2} />
            <SkeletonRows count={2} />
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="text-center py-16">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No results for &ldquo;<span className="font-medium text-neutral-700 dark:text-neutral-300">{debouncedQ}</span>&rdquo;
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasResults && (
          <div className="space-y-8">
            {(data?.meetings?.length ?? 0) > 0 && (
              <Section icon={Calendar} title="Meetings">
                {data!.meetings.map((m) => (
                  <ResultRow
                    key={m.id}
                    title={m.title}
                    subtitle={new Date(m.startTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    onClick={() => navigate(`/meetings/${m.id}`)}
                  />
                ))}
              </Section>
            )}

            {(data?.tasks?.length ?? 0) > 0 && (
              <Section icon={CheckSquare} title="Tasks">
                {data!.tasks.map((t) => (
                  <ResultRow
                    key={t.id}
                    title={t.title}
                    subtitle={
                      t.dueDate
                        ? `Due ${new Date(t.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}`
                        : t.isCompleted
                        ? 'Completed'
                        : undefined
                    }
                    onClick={() => navigate('/tasks')}
                  />
                ))}
              </Section>
            )}

            {(data?.cards?.length ?? 0) > 0 && (
              <Section icon={CreditCard} title="Cards">
                {data!.cards.map((c) => (
                  <ResultRow
                    key={c.id}
                    title={c.displayName}
                    subtitle={c.title ?? `/${c.slug}`}
                    onClick={() => navigate(`/cards/${c.id}`)}
                  />
                ))}
              </Section>
            )}

            {(data?.contacts?.length ?? 0) > 0 && (
              <Section icon={Users} title="Contacts">
                {data!.contacts.map((ct) => (
                  <ResultRow
                    key={ct.id}
                    title={ct.name}
                    subtitle={ct.company ?? ct.email ?? undefined}
                    onClick={() => navigate('/cards/contacts')}
                  />
                ))}
              </Section>
            )}
          </div>
        )}

        {/* Back link */}
        {debouncedQ.length >= 2 && (
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-xs text-neutral-400 dark:text-neutral-500"
            >
              Back
            </Button>
          </div>
        )}
      </div>
    </PageMotion>
  );
}
