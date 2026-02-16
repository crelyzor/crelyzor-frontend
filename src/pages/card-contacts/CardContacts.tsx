import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Download,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useCardContacts,
  useDeleteContact,
} from '@/hooks/queries/useCardQueries';
import { cardsApi } from '@/services/cardsService';
import { toast } from 'sonner';
import type { CardContact } from '@/types';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CardContacts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCardContacts({
    search: search || undefined,
    page,
    limit: 20,
  });

  const deleteContact = useDeleteContact();

  const handleDelete = (id: string) => {
    deleteContact.mutate(id, {
      onSuccess: () => toast.success('Contact removed'),
    });
  };

  const handleExport = async () => {
    try {
      const csv = await cardsApi.exportContacts();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Contacts exported');
    } catch {
      toast.error('Failed to export contacts');
    }
  };

  const contacts = data?.contacts ?? [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => navigate('/cards')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Contacts
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {pagination?.total ?? 0} people shared their info with you
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-neutral-600 dark:text-neutral-400"
          onClick={handleExport}
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-200 dark:border-neutral-800
                     bg-white dark:bg-neutral-900 text-sm text-neutral-950 dark:text-neutral-50
                     placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                     focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10
                     transition-shadow"
        />
      </div>

      {/* Contact list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {search ? 'No contacts match your search' : 'No contacts yet'}
          </p>
          {!search && (
            <p className="text-xs text-neutral-400 mt-1">
              Share your card and contacts will appear here
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact: CardContact) => (
            <Card
              key={contact.id}
              className="p-0 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  {/* Left: contact info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                        {contact.name}
                      </h3>
                      {contact.card && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                          /{contact.card.slug}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {contact.email && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <Mail className="w-3 h-3" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <Phone className="w-3 h-3" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.company && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <Building className="w-3 h-3" />
                          <span>{contact.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(contact.scannedAt)}</span>
                      </div>
                    </div>

                    {contact.note && (
                      <p className="text-xs text-neutral-400 mt-1.5 italic">
                        "{contact.note}"
                      </p>
                    )}
                  </div>

                  {/* Right: actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-neutral-400 hover:text-red-500"
                    onClick={() => handleDelete(contact.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-neutral-500">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
