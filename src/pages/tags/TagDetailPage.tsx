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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStatusStyle, getStatusLabel } from '@/types/meeting';
import { formatTaskDue } from '@/lib/utils';

function formatTaggedMeetingDate(meeting: { startTime?: string }) {
  if (!meeting.startTime) return 'No date';
  return new Date(meeting.startTime).toISOString().split('T')[0];
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
              <div
                key={i}
                className="h-16 w-full bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse"
              />
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
          <div className="text-center py-20 max-w-md mx-auto">
            <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Tag not found
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              This tag may belong to a different account or may have been
              deleted.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => navigate('/tags')}
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium"
              >
                Go to tags
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-200"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </PageMotion>
    );
  }

  const { tag, counts, meetings, cards, tasks, contacts } = data;
  const standardMeetings = meetings.filter((m) => m.type !== 'VOICE_NOTE');
  const voiceNotes = meetings.filter((m) => m.type === 'VOICE_NOTE');

  const tabs = [
    { id: 'meetings', label: 'Meetings', count: standardMeetings.length },
    { id: 'voice-notes', label: 'Voice Notes', count: voiceNotes.length },
    { id: 'cards', label: 'Cards', count: counts.cards },
    { id: 'contacts', label: 'Contacts', count: counts.contacts },
    { id: 'tasks', label: 'Tasks', count: counts.tasks },
  ] as const;
  const availableTabs = tabs.filter((tab) => tab.count > 0);
  const defaultTab = availableTabs[0]?.id;

  return (
    <PageMotion>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
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
            <span className="ml-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-0.5 rounded-full text-sm font-medium">
              {counts.total} items
            </span>
          </div>
        </div>

        {counts.total === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-70">
            <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-4">
              <span
                className="w-4 h-4 rounded-full"
                style={{ background: tag.color }}
              />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
              Nothing tagged with {tag.name} yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Items you tag will appear here.
            </p>
          </div>
        ) : (
          <Tabs defaultValue={defaultTab} className="pb-12">
            <TabsList className="h-auto rounded-2xl bg-neutral-100 dark:bg-neutral-900 p-1 gap-1 w-fit overflow-x-auto scrollbar-hide">
              {availableTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-3.5 py-2 text-xs font-medium whitespace-nowrap rounded-xl h-auto data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-neutral-500 dark:text-neutral-400"
                >
                  {tab.label}
                  <span className="ml-1.5 text-[10px] opacity-70">
                    {tab.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="meetings" className="mt-4">
              <div className="flex flex-col gap-2">
                {standardMeetings.map((m) => (
                  <Link
                    key={m.id}
                    to={`/meetings/${m.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition-all"
                  >
                    <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500">
                      {m.type === 'SCHEDULED' ? (
                        <CalendarIcon className="w-5 h-5" />
                      ) : m.type === 'RECORDED' ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {m.title}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {formatTaggedMeetingDate(m)}
                      </p>
                    </div>
                    {m.status && m.type === 'SCHEDULED' && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(m.status)}`}
                      >
                        {getStatusLabel(m.status)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="voice-notes" className="mt-4">
              <div className="flex flex-col gap-2">
                {voiceNotes.map((m) => (
                  <Link
                    key={m.id}
                    to={`/meetings/${m.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition-all"
                  >
                    <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {m.title}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {formatTaggedMeetingDate(m)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cards" className="mt-4">
              <div className="flex flex-col gap-2">
                {cards.map((c) => (
                  <Link
                    key={c.id}
                    to={`/cards/${c.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                      {c.avatarUrl ? (
                        <img
                          src={c.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CreditCard className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {c.displayName}
                      </h4>
                      {c.title && (
                        <p className="text-xs text-neutral-500 truncate">
                          {c.title}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="mt-4">
              <div className="flex flex-col gap-2">
                {contacts.map((c) => (
                  <Link
                    key={c.id}
                    to={`/cards/contacts?cardId=${c.cardId}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition-all"
                  >
                    <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-4">
                      <div className="flex-1 truncate">
                        <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {c.name}
                        </h4>
                        {c.email && (
                          <p className="text-xs text-neutral-500 truncate">
                            {c.email}
                          </p>
                        )}
                      </div>
                      <div className="hidden sm:flex flex-1 items-center gap-2 truncate text-xs text-neutral-500">
                        {c.company && (
                          <>
                            <Briefcase className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{c.company}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <div className="flex flex-col gap-2">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
                  >
                    <button className="text-neutral-400 pointer-events-none">
                      {t.status === 'DONE' ? (
                        <CheckCircle2 className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm ${t.status === 'DONE' ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-neutral-100'}`}
                      >
                        {t.title}
                      </span>
                    </div>
                    {t.dueDate && (
                      <span className="text-xs text-neutral-500 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded">
                        Due: {formatTaskDue(t.dueDate)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageMotion>
  );
}
