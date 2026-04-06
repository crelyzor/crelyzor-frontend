import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Video,
  Mic,
  CreditCard,
  CheckCircle2,
  Circle,
  Briefcase,
  User,
} from 'lucide-react';
import { PageMotion } from '@/components/PageMotion';
import { useTagItems } from '@/hooks/queries/useTagQueries';
import { formatMeetingDate, getStatusStyle, getStatusLabel } from '@/types/meeting';

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4 flex items-center gap-2">
      {title}
      <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded-full text-xs">
        {count}
      </span>
    </h3>
  );
}

export default function TagDetailPage() {
  const { tagId } = useParams<{ tagId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useTagItems(tagId || '');

  if (isLoading) {
    return (
      <PageMotion>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
          <div className="h-8 w-48 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </PageMotion>
    );
  }

  if (!data || !data.tag) {
    return (
      <PageMotion>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center py-20">Tag not found.</div>
        </div>
      </PageMotion>
    );
  }

  const { tag, counts, meetings, cards, tasks, contacts } = data;

  return (
    <PageMotion>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ background: tag.color }}
          />
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {tag.name}
          </h1>
          <span className="ml-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-0.5 rounded-full text-sm font-medium">
            {counts.total} items
          </span>
        </div>
      </div>

      {counts.total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-70">
          <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-4">
            <span className="w-4 h-4 rounded-full" style={{ background: tag.color }} />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">Nothing tagged with {tag.name} yet</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Items you tag will appear here.</p>
        </div>
      ) : (
        <div className="space-y-10 pb-12">
          {/* Meetings */}
          {counts.meetings > 0 && (
            <section>
              <SectionHeader title="Meetings" count={counts.meetings} />
              <div className="flex flex-col gap-2">
                {meetings.map((m) => (
                  <Link
                    key={m.id}
                    to={`/meetings/${m.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-primary/30 bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition-all"
                  >
                    <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500">
                      {m.type === 'SCHEDULED' ? <CalendarIcon className="w-5 h-5" /> : m.type === 'RECORDED' ? <Video className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{m.title}</h4>
                      <p className="text-xs text-neutral-500">{m.startTime ? formatMeetingDate(m) : 'No date'}</p>
                    </div>
                    {m.status && m.type === 'SCHEDULED' && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(m.status)}`}>
                        {getStatusLabel(m.status)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Cards */}
          {counts.cards > 0 && (
            <section>
              <SectionHeader title="Cards" count={counts.cards} />
              <div className="flex flex-col gap-2">
                {cards.map((c) => (
                  <Link
                    key={c.id}
                    to={`/cards/${c.id}/edit`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-primary/30 bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                      {c.avatarUrl ? (
                         <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                         <CreditCard className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{c.displayName}</h4>
                      {c.title && <p className="text-xs text-neutral-500 truncate">{c.title}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Contacts */}
          {counts.contacts > 0 && (
            <section>
              <SectionHeader title="Contacts" count={counts.contacts} />
              <div className="flex flex-col gap-2">
                {contacts.map((c) => (
                  <Link
                    key={c.id}
                    to={`/cards/${c.cardId}/edit?tab=contacts`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-primary/30 bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition-all"
                  >
                     <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-4">
                      <div className="flex-1 truncate">
                        <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{c.name}</h4>
                        {c.email && <p className="text-xs text-neutral-500 truncate">{c.email}</p>}
                      </div>
                      <div className="hidden sm:flex flex-1 items-center gap-2 truncate text-xs text-neutral-500">
                        {c.company && (
                          <><Briefcase className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{c.company}</span></>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tasks */}
          {counts.tasks > 0 && (
            <section>
              <SectionHeader title="Tasks" count={counts.tasks} />
              <div className="flex flex-col gap-2">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
                  >
                    <button className="text-neutral-400 pointer-events-none">
                      {t.status === 'DONE' ? (
                        <CheckCircle2 className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${t.status === 'DONE' ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-neutral-100'}`}>
                        {t.title}
                      </span>
                    </div>
                    {t.dueDate && (
                      <span className="text-xs text-neutral-500 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded">
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      </div>
    </PageMotion>
  );
}
