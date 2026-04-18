'use client';

import { ReactNode } from 'react';

export type ProfileFrame = 'none' | 'gold' | 'rose' | 'lavender' | 'mint' | 'glitter' | 'rainbow' | 'crown' | 'hearts' | 'stars';

export const FRAMES: { key: ProfileFrame; label: string; emoji: string; preview: string }[] = [
  { key: 'none', label: 'Sin marco', emoji: '⚪', preview: '' },
  { key: 'gold', label: 'Dorado', emoji: '🏆', preview: '' },
  { key: 'rose', label: 'Rosa', emoji: '🌹', preview: '' },
  { key: 'lavender', label: 'Lavanda', emoji: '💜', preview: '' },
  { key: 'mint', label: 'Menta', emoji: '🌿', preview: '' },
  { key: 'glitter', label: 'Brillos', emoji: '✨', preview: '' },
  { key: 'rainbow', label: 'Arcoíris', emoji: '🌈', preview: '' },
  { key: 'crown', label: 'Corona', emoji: '👑', preview: '👑' },
  { key: 'hearts', label: 'Corazones', emoji: '💕', preview: '💕' },
  { key: 'stars', label: 'Estrellas', emoji: '⭐', preview: '⭐' },
];

function frameBorder(frame: ProfileFrame): string {
  switch (frame) {
    case 'gold': return 'ring-4 ring-amber-400 ring-offset-2 ring-offset-white shadow-[0_0_16px_rgba(251,191,36,0.5)]';
    case 'rose': return 'ring-4 ring-blush-400 ring-offset-2 ring-offset-white shadow-[0_0_16px_rgba(243,166,191,0.6)]';
    case 'lavender': return 'ring-4 ring-lavender-400 ring-offset-2 ring-offset-white shadow-[0_0_16px_rgba(179,157,219,0.55)]';
    case 'mint': return 'ring-4 ring-mint-400 ring-offset-2 ring-offset-white shadow-[0_0_16px_rgba(52,211,153,0.45)]';
    case 'glitter': return 'ring-4 ring-offset-2 ring-offset-white';
    case 'rainbow': return 'ring-offset-2 ring-offset-white';
    case 'crown':
    case 'hearts':
    case 'stars':
      return 'ring-2 ring-cream-200 ring-offset-2 ring-offset-white';
    default: return 'border-4 border-blush-200';
  }
}

// Marco especial que requiere background rotativo (rainbow/glitter)
function outerLayer(frame: ProfileFrame): { className: string; style?: React.CSSProperties } {
  if (frame === 'rainbow') {
    return {
      className: 'p-[3px] rounded-full',
      style: {
        background: 'conic-gradient(from 0deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f472b6, #f87171)',
      },
    };
  }
  if (frame === 'glitter') {
    return {
      className: 'p-[3px] rounded-full',
      style: {
        background: 'linear-gradient(135deg, #fcd34d, #f9a8d4, #a5b4fc, #fcd34d)',
      },
    };
  }
  return { className: '' };
}

export default function ProfileAvatar({
  src,
  name,
  frame = 'none',
  size = 80,
  badge,
}: {
  src?: string | null;
  name?: string | null;
  frame?: ProfileFrame;
  size?: number;
  badge?: string;
}) {
  const outer = outerLayer(frame);
  const avatarInner = (
    <div
      className={`relative rounded-full overflow-hidden bg-white flex items-center justify-center ${frameBorder(frame)}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name || ''} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl font-bold text-blush-400">{name?.charAt(0).toUpperCase() || '?'}</span>
      )}

      {/* Decorativos flotando alrededor */}
      {frame === 'crown' && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl drop-shadow-sm">👑</span>
      )}
      {frame === 'hearts' && (
        <>
          <span className="absolute -top-1 -right-1 text-base">💕</span>
          <span className="absolute -bottom-1 -left-1 text-base">💗</span>
        </>
      )}
      {frame === 'stars' && (
        <>
          <span className="absolute -top-1 -right-2 text-base">⭐</span>
          <span className="absolute -bottom-0 -left-2 text-sm">✨</span>
          <span className="absolute top-0 -left-2 text-xs">✨</span>
        </>
      )}
    </div>
  );

  return (
    <div className="relative inline-block">
      {outer.className ? (
        <div className={outer.className} style={outer.style}>{avatarInner}</div>
      ) : avatarInner}
      {badge && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-cocoa-700 shadow-soft border border-cream-200 whitespace-nowrap">
          {badge}
        </span>
      )}
    </div>
  );
}
