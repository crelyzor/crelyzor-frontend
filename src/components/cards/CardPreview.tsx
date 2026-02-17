import {
  Globe,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import type { CardLink, CardContactFields, CardTheme } from '@/types';

const GOLD = '#d4af61';

const SOCIAL_ICONS: Record<string, typeof Globe> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  instagram: Instagram,
};

interface CardPreviewProps {
  displayName: string;
  title?: string;
  bio?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  links: CardLink[];
  contactFields: CardContactFields;
  theme?: CardTheme;
  /** Which face to show — defaults to 'front' */
  face?: 'front' | 'back';
}

export function CardPreview({
  displayName,
  title,
  bio,
  avatarUrl,
  contactFields,
  links,
  theme,
  coverUrl,
  face = 'front',
}: CardPreviewProps) {
  const accent = theme?.primaryColor || GOLD;
  const socialLinks = links.filter((l) => SOCIAL_ICONS[l.type]);

  const cardBase = {
    aspectRatio: '1.586 / 1',
    background: '#0a0a0a',
    fontFamily: theme?.fontFamily || 'Inter, system-ui, sans-serif',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.4)',
  };

  if (face === 'back') {
    return (
      <div
        className="relative rounded-2xl overflow-hidden select-none"
        style={cardBase}
      >
        {/* Diagonal texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              135deg,
              transparent,
              transparent 8px,
              rgba(255,255,255,0.1) 8px,
              rgba(255,255,255,0.1) 9px
            )`,
          }}
        />

        {/* Back content */}
        <div className="relative h-full flex flex-col justify-between p-4">
          {/* Bio */}
          <div className="flex-1 min-h-0">
            {bio ? (
              <p className="text-neutral-300 text-[9px] leading-relaxed line-clamp-3">
                {bio}
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-px flex-1" style={{ backgroundColor: `${accent}55` }} />
                <span className="text-[8px] tracking-widest uppercase" style={{ color: accent }}>
                  {displayName || 'Your Name'}
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: `${accent}55` }} />
              </div>
            )}
          </div>

          {/* Social icons row */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              {socialLinks.map((link, i) => {
                const Icon = SOCIAL_ICONS[link.type];
                return (
                  <span
                    key={i}
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `${accent}22`, color: accent }}
                  >
                    <Icon className="w-2.5 h-2.5" />
                  </span>
                );
              })}
            </div>
          )}

          {/* Booking link */}
          {contactFields.bookingUrl && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-md mb-1"
              style={{ backgroundColor: `${accent}18` }}
            >
              <Calendar className="w-2.5 h-2.5 shrink-0" style={{ color: accent }} />
              <p className="text-[8px] font-medium truncate" style={{ color: accent }}>
                Book a meeting
              </p>
            </div>
          )}

          {/* Bottom: website */}
          <div className="flex items-end justify-between">
            {contactFields.website ? (
              <p className="text-neutral-300 text-[8px] tracking-wide truncate max-w-[70%]">
                {contactFields.website.replace(/^https?:\/\/(www\.)?/, '')}
              </p>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${accent}66, ${accent})` }}
        />
      </div>
    );
  }

  // ── FRONT FACE ──
  return (
    <div
      className="relative rounded-2xl overflow-hidden select-none"
      style={cardBase}
    >
      {/* Subtle diagonal texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            135deg,
            transparent,
            transparent 8px,
            rgba(255,255,255,0.1) 8px,
            rgba(255,255,255,0.1) 9px
          )`,
        }}
      />

      {/* Cover image */}
      {coverUrl && (
        <div className="absolute inset-0">
          <img
            src={coverUrl}
            alt=""
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/60" />
        </div>
      )}

      {/* Card content */}
      <div className="relative h-full flex flex-col justify-between p-4">
        {/* Top: avatar + identity */}
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
            style={{
              boxShadow: `0 0 0 1.5px ${accent}`,
              backgroundColor: '#1a1a1a',
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold" style={{ color: accent }}>
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>

          <div className="min-w-0 pt-px">
            <p className="text-white font-semibold text-[13px] leading-tight tracking-tight truncate">
              {displayName || 'Your Name'}
            </p>
            {title && (
              <p
                className="text-[10px] mt-0.5 leading-snug truncate"
                style={{ color: accent }}
              >
                {title}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: contact + social icons */}
        <div className="flex items-end justify-between">
          <div className="space-y-0.5 min-w-0">
            {contactFields.email && (
              <p className="text-neutral-300 text-[8px] tracking-wide truncate flex items-center gap-1">
                <Mail className="w-2 h-2 shrink-0" style={{ color: accent }} />
                {contactFields.email}
              </p>
            )}
            {contactFields.phone && (
              <p className="text-neutral-300 text-[8px] tracking-wide flex items-center gap-1">
                <Phone className="w-2 h-2 shrink-0" style={{ color: accent }} />
                {contactFields.phone}
              </p>
            )}
            {contactFields.location && (
              <p className="text-neutral-400 text-[8px] tracking-wide flex items-center gap-1">
                <MapPin
                  className="w-2 h-2 shrink-0"
                  style={{ color: accent }}
                />
                {contactFields.location}
              </p>
            )}
          </div>

          {/* Social icons */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1.5">
              {socialLinks.map((link, i) => {
                const Icon = SOCIAL_ICONS[link.type];
                return (
                  <span key={i} style={{ color: accent }}>
                    <Icon className="w-3 h-3" />
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}66)` }}
      />
    </div>
  );
}
