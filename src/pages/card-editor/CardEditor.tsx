import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Link2,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useCard,
  useCreateCard,
  useUpdateCard,
} from '@/hooks/queries/useCardQueries';
import { toast } from 'sonner';
import type { CardLink, CardContactFields, CardTheme } from '@/types';
import { CardPreview } from '@/components/cards/CardPreview';
import { ThemeCustomizer } from '@/components/cards/ThemeCustomizer';

const LINK_ICONS: Record<string, typeof Globe> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  instagram: Instagram,
  website: Globe,
  custom: Link2,
};

const LINK_TYPES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'github', label: 'GitHub' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website' },
  { value: 'custom', label: 'Custom Link' },
];

export default function CardEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { data: existingCard, isLoading } = useCard(id ?? '');
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [slug, setSlug] = useState('');
  const [links, setLinks] = useState<CardLink[]>([]);
  const [contactFields, setContactFields] = useState<CardContactFields>({});
  const [isDefault, setIsDefault] = useState(false);
  const [theme, setTheme] = useState<CardTheme>({});
  const [showPreview, setShowPreview] = useState(false);

  // Load existing card data
  useEffect(() => {
    if (existingCard) {
      setDisplayName(existingCard.displayName);
      setTitle(existingCard.title ?? '');
      setBio(existingCard.bio ?? '');
      setSlug(existingCard.slug);
      setLinks((existingCard.links as CardLink[]) ?? []);
      setContactFields((existingCard.contactFields as CardContactFields) ?? {});
      setIsDefault(existingCard.isDefault);
      setTheme((existingCard.theme as CardTheme) ?? {});
    }
  }, [existingCard]);

  const addLink = () => {
    setLinks([...links, { type: 'website', url: '', label: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof CardLink, value: string) => {
    setLinks(links.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    const data = {
      displayName: displayName.trim(),
      title: title.trim() || undefined,
      bio: bio.trim() || undefined,
      slug: slug.trim() || undefined,
      links: links.filter((l) => l.url.trim()),
      contactFields,
      theme,
      isDefault,
    };

    if (isEditing) {
      updateCard.mutate(
        { id, data },
        {
          onSuccess: () => {
            toast.success('Card updated');
            navigate('/cards');
          },
          onError: () => toast.error('Failed to update card'),
        }
      );
    } else {
      createCard.mutate(data, {
        onSuccess: () => {
          toast.success('Card created');
          navigate('/cards');
        },
        onError: () => toast.error('Failed to create card'),
      });
    }
  };

  const isSaving = createCard.isPending || updateCard.isPending;

  if (isEditing && isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-96 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => navigate('/cards')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
              {isEditing ? 'Edit Card' : 'Create Card'}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {isEditing
                ? 'Update your digital card details'
                : 'Set up your digital business card'}
            </p>
          </div>
        </div>

        {/* Mobile preview toggle */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden text-xs h-8 gap-1.5"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Preview
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Left column — Form */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Mobile preview */}
          {showPreview && (
            <div className="lg:hidden">
              <CardPreview
                displayName={displayName}
                title={title}
                bio={bio}
                links={links}
                contactFields={contactFields}
                theme={theme}
              />
            </div>
          )}

          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Basic Info
            </h2>

            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label className="text-neutral-700 dark:text-neutral-300">
                  Display Name *
                </Label>
                <Input
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-neutral-700 dark:text-neutral-300">
                  Title
                </Label>
                <Input
                  placeholder="e.g. Software Engineer @ Acme"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-neutral-700 dark:text-neutral-300">
                  Bio
                </Label>
                <Textarea
                  placeholder="A short intro about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-neutral-700 dark:text-neutral-300">
                  Card Slug
                </Label>
                <Input
                  placeholder="e.g. work, personal, freelance"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                    )
                  }
                  className="h-11"
                />
                <p className="text-xs text-neutral-400">
                  Your card will be accessible at /username/{slug || 'default'}
                </p>
              </div>
            </div>
          </section>

          {/* Contact Fields */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Contact Info
            </h2>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-neutral-500" />
                </div>
                <Input
                  placeholder="Email address"
                  value={contactFields.email ?? ''}
                  onChange={(e) =>
                    setContactFields({ ...contactFields, email: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-neutral-500" />
                </div>
                <Input
                  placeholder="Phone number"
                  value={contactFields.phone ?? ''}
                  onChange={(e) =>
                    setContactFields({ ...contactFields, phone: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-neutral-500" />
                </div>
                <Input
                  placeholder="Location"
                  value={contactFields.location ?? ''}
                  onChange={(e) =>
                    setContactFields({
                      ...contactFields,
                      location: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-neutral-500" />
                </div>
                <Input
                  placeholder="Website URL"
                  value={contactFields.website ?? ''}
                  onChange={(e) =>
                    setContactFields({
                      ...contactFields,
                      website: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                </div>
                <Input
                  placeholder="Booking link (e.g. calendly.com/you)"
                  value={contactFields.bookingUrl ?? ''}
                  onChange={(e) =>
                    setContactFields({
                      ...contactFields,
                      bookingUrl: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Social Links
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-neutral-600 dark:text-neutral-400"
                onClick={addLink}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Link
              </Button>
            </div>

            {links.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                <Link2 className="w-5 h-5 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="text-xs text-neutral-400">
                  Add social links to your card
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link, index) => {
                  const IconComp = LINK_ICONS[link.type] ?? Globe;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                        <IconComp className="w-4 h-4 text-neutral-500" />
                      </div>

                      <div className="flex-1 grid gap-2">
                        <select
                          value={link.type}
                          onChange={(e) =>
                            updateLink(index, 'type', e.target.value)
                          }
                          className="h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900
                                     text-sm text-neutral-700 dark:text-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                        >
                          {LINK_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>

                        <Input
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) =>
                            updateLink(index, 'url', e.target.value)
                          }
                          className="h-9 text-sm"
                        />

                        <Input
                          placeholder="Label (e.g. My Portfolio)"
                          value={link.label}
                          onChange={(e) =>
                            updateLink(index, 'label', e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-neutral-400 hover:text-red-500"
                        onClick={() => removeLink(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Theme */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Theme & Customization
            </h2>
            <ThemeCustomizer theme={theme} onChange={setTheme} />
          </section>

          {/* Options */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Options
            </h2>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 focus:ring-neutral-900/20"
              />
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Set as default card
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  This card will be shown when someone visits your profile URL
                </p>
              </div>
            </label>
          </section>
        </div>

        {/* Right column — Preview (desktop only) */}
        <div className="hidden lg:block w-[340px] shrink-0">
          <div className="sticky top-6">
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
              Preview
            </p>
            <CardPreview
              displayName={displayName}
              title={title}
              bio={bio}
              links={links}
              contactFields={contactFields}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            className="h-10 px-4 text-sm"
            onClick={() => navigate('/cards')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !displayName.trim()}
            className="h-10 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200
                       text-white dark:text-neutral-900 text-sm font-medium"
          >
            {isSaving
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Create Card'}
          </Button>
        </div>
      </div>
    </div>
  );
}
