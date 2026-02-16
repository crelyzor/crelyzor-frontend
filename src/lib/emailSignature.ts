import type { Card } from '@/types';

const CARDS_PUBLIC_URL =
  import.meta.env.VITE_CARDS_PUBLIC_URL ?? 'http://localhost:5174';

interface SignatureOptions {
  includeSocials: boolean;
}

export function generateSignatureHtml(
  card: Card,
  options: SignatureOptions
): string {
  const cf = (card.contactFields ?? {}) as Record<string, string | undefined>;
  const links = (card.links ?? []).filter((l) => l.url);
  const cardUrl = `${CARDS_PUBLIC_URL}/${card.slug}`;

  const socialLinks =
    options.includeSocials && links.length > 0
      ? links
          .map(
            (l) =>
              `<a href="${l.url}" style="color:#525252;text-decoration:none;font-size:12px;" target="_blank">${l.label || l.type}</a>`
          )
          .join(' &middot; ')
      : '';

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#171717;line-height:1.4;">
  <tr>
    <td style="padding-right:16px;vertical-align:top;">
      <div style="width:48px;height:48px;border-radius:8px;background:#f5f5f5;text-align:center;line-height:48px;font-size:18px;font-weight:600;color:#737373;">
        ${card.displayName.charAt(0).toUpperCase()}
      </div>
    </td>
    <td style="vertical-align:top;">
      <div style="font-size:14px;font-weight:600;color:#0a0a0a;">${card.displayName}</div>
      ${card.title ? `<div style="font-size:12px;color:#737373;margin-top:2px;">${card.title}</div>` : ''}
      <div style="margin-top:8px;">
        ${cf.email ? `<div style="font-size:12px;color:#525252;">${cf.email}</div>` : ''}
        ${cf.phone ? `<div style="font-size:12px;color:#525252;">${cf.phone}</div>` : ''}
      </div>
      <div style="margin-top:8px;">
        <a href="${cardUrl}" style="display:inline-block;padding:4px 12px;border-radius:6px;background:#171717;color:#ffffff;font-size:11px;font-weight:500;text-decoration:none;" target="_blank">View my card</a>
      </div>
      ${socialLinks ? `<div style="margin-top:8px;">${socialLinks}</div>` : ''}
    </td>
  </tr>
</table>`;
}
