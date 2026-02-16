import {
  Globe,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Link2,
  Mail,
  Phone,
  MapPin,
  Save,
  UserPlus,
} from 'lucide-react';
import type { CardLink, CardContactFields, CardTheme } from '@/types';

const LINK_ICONS: Record<string, typeof Globe> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  instagram: Instagram,
  website: Globe,
  custom: Link2,
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
}

export function CardPreview({
  displayName,
  title,
  bio,
  links,
  contactFields,
  theme,
}: CardPreviewProps) {
  const primaryColor = theme?.primaryColor || '#171717';
  const bgColor = theme?.backgroundColor || '#ffffff';
  const fontFamily = theme?.fontFamily || 'Inter, system-ui, sans-serif';
  const isDark = theme?.darkMode ?? false;
  const layout = theme?.layout || 'classic';

  const textPrimary = isDark ? '#fafafa' : '#0a0a0a';
  const textSecondary = isDark ? '#a3a3a3' : '#737373';
  const borderColor = isDark ? '#262626' : '#f5f5f5';
  const surfaceColor = isDark ? '#171717' : '#ffffff';

  const filteredLinks = links.filter((l) => l.url.trim());

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm border"
      style={{
        fontFamily,
        backgroundColor: bgColor,
        borderColor,
        color: textPrimary,
      }}
    >
      {/* Cover */}
      {layout !== 'minimal' && (
        <div
          className="h-20"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
          }}
        />
      )}

      <div
        className="px-5"
        style={{ backgroundColor: surfaceColor }}
      >
        {/* Avatar */}
        <div className={layout !== 'minimal' ? '-mt-8 mb-3' : 'pt-5 mb-3'}>
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border-[3px]"
            style={{
              borderColor: surfaceColor,
              backgroundColor: borderColor,
            }}
          >
            <span className="text-lg font-semibold" style={{ color: textSecondary }}>
              {displayName ? displayName.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
        </div>

        {/* Name & title */}
        <div className="mb-4">
          <p className="text-sm font-semibold leading-tight" style={{ color: textPrimary }}>
            {displayName || 'Your Name'}
          </p>
          {title && (
            <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
              {title}
            </p>
          )}
          {bio && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: textSecondary }}>
              {bio}
            </p>
          )}
        </div>

        {/* Contact actions */}
        <div className="flex gap-1.5 mb-4">
          {contactFields.email && (
            <div
              className="flex-1 flex items-center justify-center gap-1 h-7 rounded-lg text-white text-[10px] font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              <Mail className="w-3 h-3" />
              Email
            </div>
          )}
          {contactFields.phone && (
            <div
              className="flex-1 flex items-center justify-center gap-1 h-7 rounded-lg border text-[10px] font-medium"
              style={{ borderColor, color: textSecondary }}
            >
              <Phone className="w-3 h-3" />
              Call
            </div>
          )}
          {contactFields.website && (
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg border"
              style={{ borderColor, color: textSecondary }}
            >
              <Globe className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Location */}
        {contactFields.location && (
          <div className="flex items-center gap-1.5 mb-4 text-[10px]" style={{ color: textSecondary }}>
            <MapPin className="w-3 h-3 shrink-0" />
            {contactFields.location}
          </div>
        )}
      </div>

      {/* Links */}
      {filteredLinks.length > 0 && (
        <div className="px-5 pb-4" style={{ backgroundColor: surfaceColor }}>
          <div className="h-px mb-3" style={{ backgroundColor: borderColor }} />
          <div className="space-y-1.5">
            {filteredLinks.map((link, i) => {
              const Icon = LINK_ICONS[link.type] ?? Globe;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                  style={{ borderColor }}
                >
                  <Icon className="w-3 h-3 shrink-0" style={{ color: textSecondary }} />
                  <span className="flex-1 text-[10px] font-medium truncate" style={{ color: textPrimary }}>
                    {link.label || link.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-5 pb-4 flex gap-1.5" style={{ backgroundColor: surfaceColor }}>
        <div
          className="flex-1 flex items-center justify-center gap-1 h-8 rounded-xl text-white text-[10px] font-medium"
          style={{ backgroundColor: primaryColor }}
        >
          <Save className="w-3 h-3" />
          Save Contact
        </div>
        <div
          className="flex-1 flex items-center justify-center gap-1 h-8 rounded-xl border text-[10px] font-medium"
          style={{ borderColor, color: textSecondary }}
        >
          <UserPlus className="w-3 h-3" />
          Share My Info
        </div>
      </div>
    </div>
  );
}
