'use client';

import { CSSProperties } from 'react';

// Marcos estilo gamer/código — sin emojis decorativos. Todo CSS puro.
export type ProfileFrame =
  | 'none'
  | 'terminal'
  | 'neon'
  | 'matrix'
  | 'cyberpunk'
  | 'hacker'
  | 'rgb'
  | 'pixel'
  | 'hologram'
  | 'elite'
  // Legacy
  | 'gold' | 'rose' | 'lavender' | 'mint' | 'glitter' | 'rainbow' | 'crown' | 'hearts' | 'stars';

export const FRAMES: { key: ProfileFrame; label: string; tier: string }[] = [
  { key: 'none',      label: 'Sin marco', tier: 'base' },
  { key: 'terminal',  label: 'Terminal',  tier: 'common' },
  { key: 'neon',      label: 'Neon',      tier: 'uncommon' },
  { key: 'matrix',    label: 'Matrix',    tier: 'rare' },
  { key: 'cyberpunk', label: 'Cyberpunk', tier: 'rare' },
  { key: 'hacker',    label: 'Hacker',    tier: 'epic' },
  { key: 'rgb',       label: 'RGB',       tier: 'epic' },
  { key: 'pixel',     label: 'Pixel',     tier: 'legendary' },
  { key: 'hologram',  label: 'Hologram',  tier: 'legendary' },
  { key: 'elite',     label: 'Elite',     tier: 'mythic' },
];

export const TIER_COLOR: Record<string, string> = {
  base: 'text-cocoa-400',
  common: 'text-slate-500',
  uncommon: 'text-green-500',
  rare: 'text-sky-500',
  epic: 'text-purple-500',
  legendary: 'text-amber-500',
  mythic: 'text-rose-500',
};

// Estilo del aro exterior (rotativo o color sólido)
function outerLayer(frame: ProfileFrame): { className: string; style?: CSSProperties; animate?: boolean } {
  switch (frame) {
    case 'terminal':
      return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(135deg, #0f0 0%, #0a0 100%)', boxShadow: '0 0 12px rgba(0,255,0,0.4)' } };
    case 'neon':
      return { className: 'p-[3px] rounded-full', style: { background: 'conic-gradient(from 0deg, #ff00e0, #00e7ff, #ff00e0)', boxShadow: '0 0 20px rgba(255,0,224,0.5)' }, animate: true };
    case 'matrix':
      return { className: 'p-[3px] rounded-full', style: { background: 'repeating-linear-gradient(45deg, #00ff41, #00ff41 3px, #003b0f 3px, #003b0f 6px)', boxShadow: '0 0 14px rgba(0,255,65,0.5)' } };
    case 'cyberpunk':
      return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(90deg, #ff2a6d, #05d9e8, #d1f7ff, #ff2a6d)', boxShadow: '0 0 16px rgba(255,42,109,0.55)' } };
    case 'hacker':
      return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(135deg, #ff0033 0%, #330000 50%, #ff0033 100%)', boxShadow: '0 0 16px rgba(255,0,51,0.5)' } };
    case 'rgb':
      return { className: 'p-[3px] rounded-full rgb-spin', style: { background: 'conic-gradient(from 0deg, #ff0000, #ff9900, #ffee00, #33ff00, #00ffee, #0066ff, #9900ff, #ff0099, #ff0000)' } };
    case 'pixel':
      return { className: 'p-[4px] rounded-sm', style: { background: 'conic-gradient(from 90deg at 50% 50%, #22c55e 0 25%, #3b82f6 0 50%, #f59e0b 0 75%, #ef4444 0)' } };
    case 'hologram':
      return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(120deg, rgba(180,255,255,0.8), rgba(255,180,255,0.8), rgba(255,255,180,0.8), rgba(180,255,255,0.8))', boxShadow: '0 0 22px rgba(160,200,255,0.55)' }, animate: true };
    case 'elite':
      return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(45deg, #fde68a 0%, #f59e0b 30%, #b45309 50%, #f59e0b 70%, #fde68a 100%)', boxShadow: '0 0 18px rgba(245,158,11,0.55)' } };

    // Legacy fallback — anillos simples
    case 'gold':     return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(135deg, #fcd34d, #b45309)' } };
    case 'rose':     return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(135deg, #fda4af, #be123c)' } };
    case 'lavender': return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(135deg, #ddd6fe, #6d28d9)' } };
    case 'mint':     return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(135deg, #bbf7d0, #15803d)' } };
    case 'glitter':  return { className: 'p-[3px] rounded-full', style: { background: 'linear-gradient(135deg, #fcd34d, #f9a8d4, #a5b4fc, #fcd34d)' } };
    case 'rainbow':  return { className: 'p-[3px] rounded-full', style: { background: 'conic-gradient(from 0deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f472b6, #f87171)' } };
    case 'crown':
    case 'hearts':
    case 'stars':    return { className: 'p-[2px] rounded-full', style: { background: '#fbbf24' } };

    default: return { className: '' };
  }
}

function innerBorder(frame: ProfileFrame): string {
  if (frame === 'pixel') return 'rounded-sm border-2 border-black';
  if (frame === 'none') return 'rounded-full border-2 border-blush-200';
  return 'rounded-full';
}

// Overlay decorativo (scanlines terminal/matrix, glitch cyberpunk, etc.) — todo CSS, nada de emojis
function overlay(frame: ProfileFrame): React.ReactNode {
  switch (frame) {
    case 'terminal':
      return <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,255,0,0.10) 0px, rgba(0,255,0,0.10) 1px, transparent 1px, transparent 3px)', mixBlendMode: 'overlay' }} />;
    case 'matrix':
      return <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: 'radial-gradient(ellipse at center, rgba(0,255,65,0.15), transparent 70%)' }} />;
    case 'cyberpunk':
      return <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(255,42,109,0.15), rgba(5,217,232,0.15))' }} />;
    case 'hacker':
      return <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: 'radial-gradient(ellipse at center, rgba(255,0,51,0.18), transparent 70%)' }} />;
    case 'hologram':
      return <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: 'linear-gradient(120deg, rgba(180,255,255,0.18), rgba(255,180,255,0.18))' }} />;
    default:
      return null;
  }
}

// Badge "código" debajo del avatar — con chevrons tipo CLI
function codeBadge(frame: ProfileFrame, text: string): { pre: string; post: string; bg: string; fg: string } {
  const map: Record<string, { pre: string; post: string; bg: string; fg: string }> = {
    terminal: { pre: '>_ ', post: '', bg: 'bg-black', fg: 'text-green-400' },
    neon:     { pre: '⟨ ', post: ' ⟩', bg: 'bg-[#18021f]', fg: 'text-pink-300' },
    matrix:   { pre: '[ ', post: ' ]', bg: 'bg-[#001a08]', fg: 'text-green-300' },
    cyberpunk:{ pre: '// ', post: '', bg: 'bg-[#0b0f1e]', fg: 'text-cyan-300' },
    hacker:   { pre: 'root@ ', post: ' #', bg: 'bg-black', fg: 'text-red-400' },
    rgb:      { pre: '‹ ', post: ' ›', bg: 'bg-slate-900', fg: 'text-white' },
    pixel:    { pre: 'LV.', post: '', bg: 'bg-indigo-600', fg: 'text-yellow-300' },
    hologram: { pre: '◇ ', post: ' ◇', bg: 'bg-slate-800/90', fg: 'text-sky-200' },
    elite:    { pre: '★ ', post: ' ★', bg: 'bg-amber-700', fg: 'text-yellow-200' },
  };
  return map[frame] || { pre: '', post: '', bg: 'bg-white', fg: 'text-cocoa-700' };
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
  const inner = innerBorder(frame);

  const avatarInner = (
    <div
      className={`relative overflow-hidden bg-white flex items-center justify-center ${inner}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name || ''} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl font-bold text-blush-400">{name?.charAt(0).toUpperCase() || '?'}</span>
      )}
      {overlay(frame)}
    </div>
  );

  const cb = badge ? codeBadge(frame, badge) : null;

  return (
    <div className="relative inline-block">
      {outer.className ? (
        <div className={`${outer.className} ${outer.animate ? 'gamer-frame-spin' : ''}`} style={outer.style}>{avatarInner}</div>
      ) : avatarInner}

      {badge && cb && (
        <span
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold whitespace-nowrap shadow-lg border border-black/20 ${cb.bg} ${cb.fg}`}
          style={{ letterSpacing: '0.02em' }}
        >
          {cb.pre}{badge}{cb.post}
        </span>
      )}
    </div>
  );
}
