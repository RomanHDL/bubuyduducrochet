// ═══ Animated Background — 7 themes, lots of floating emojis ═══

const THEMES: Record<string, { gradient: string; blobs: { color: string; pos: string; size: string; delay: string }[]; emojis: { char: string; pos: string; anim: string; delay: string; size?: string }[] }> = {
  pink: {
    gradient: 'from-blush-50 via-cream-50 to-lavender-50',
    blobs: [
      { color: 'bg-blush-200/30', pos: 'top-0 left-0', size: 'w-72 h-72', delay: '0s' },
      { color: 'bg-lavender-200/25', pos: 'bottom-0 right-0', size: 'w-96 h-96', delay: '3s' },
      { color: 'bg-sky-100/20', pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', size: 'w-80 h-80', delay: '6s' },
    ],
    emojis: [
      { char: '🧸', pos: 'top-[5%] left-[6%]', anim: 'anim-float', delay: '0s' },
      { char: '🧶', pos: 'top-[8%] right-[10%]', anim: 'anim-float-r', delay: '1s' },
      { char: '💕', pos: 'bottom-[15%] left-[18%]', anim: 'anim-drift', delay: '2s' },
      { char: '✨', pos: 'top-[30%] right-[5%]', anim: 'anim-sparkle', delay: '1.5s' },
      { char: '💖', pos: 'top-[20%] left-[3%]', anim: 'anim-sparkle', delay: '3s' },
      { char: '🌸', pos: 'bottom-[25%] right-[8%]', anim: 'anim-float', delay: '4s' },
      { char: '🎀', pos: 'top-[50%] left-[2%]', anim: 'anim-float-r', delay: '2.5s' },
      { char: '💝', pos: 'bottom-[8%] right-[15%]', anim: 'anim-drift', delay: '5s' },
      { char: '🦋', pos: 'top-[65%] right-[3%]', anim: 'anim-float', delay: '1s' },
      { char: '🌷', pos: 'bottom-[35%] left-[5%]', anim: 'anim-sparkle', delay: '3.5s' },
    ],
  },
  lavender: {
    gradient: 'from-lavender-50 via-blush-50 to-sky-50',
    blobs: [
      { color: 'bg-lavender-200/35', pos: 'top-0 right-0', size: 'w-80 h-80', delay: '0s' },
      { color: 'bg-blush-200/25', pos: 'bottom-0 left-0', size: 'w-72 h-72', delay: '4s' },
      { color: 'bg-mint-100/20', pos: 'top-1/3 left-1/3', size: 'w-64 h-64', delay: '7s' },
    ],
    emojis: [
      { char: '🦋', pos: 'top-[6%] right-[8%]', anim: 'anim-float', delay: '0s' },
      { char: '💜', pos: 'bottom-[12%] left-[12%]', anim: 'anim-float-r', delay: '2s' },
      { char: '✨', pos: 'top-[22%] left-[4%]', anim: 'anim-sparkle', delay: '1s' },
      { char: '🔮', pos: 'top-[45%] right-[3%]', anim: 'anim-drift', delay: '3s' },
      { char: '🪻', pos: 'bottom-[20%] right-[10%]', anim: 'anim-float', delay: '4s' },
      { char: '💫', pos: 'top-[60%] left-[5%]', anim: 'anim-sparkle', delay: '2.5s' },
      { char: '🌙', pos: 'top-[10%] left-[15%]', anim: 'anim-float-r', delay: '5s' },
      { char: '☁️', pos: 'bottom-[30%] left-[3%]', anim: 'anim-drift', delay: '1.5s' },
      { char: '💕', pos: 'top-[75%] right-[6%]', anim: 'anim-float', delay: '3.5s' },
    ],
  },
  mint: {
    gradient: 'from-mint-50 via-cream-50 to-sky-50',
    blobs: [
      { color: 'bg-mint-200/30', pos: 'top-0 left-0', size: 'w-80 h-80', delay: '0s' },
      { color: 'bg-sky-200/25', pos: 'bottom-0 right-0', size: 'w-72 h-72', delay: '5s' },
      { color: 'bg-lavender-100/20', pos: 'top-1/2 right-1/4', size: 'w-64 h-64', delay: '3s' },
    ],
    emojis: [
      { char: '🌿', pos: 'top-[5%] left-[8%]', anim: 'anim-float', delay: '0s' },
      { char: '🍃', pos: 'bottom-[10%] right-[6%]', anim: 'anim-float-r', delay: '1.5s' },
      { char: '🌸', pos: 'top-[25%] right-[4%]', anim: 'anim-sparkle', delay: '2.5s' },
      { char: '🌱', pos: 'top-[50%] left-[3%]', anim: 'anim-drift', delay: '3s' },
      { char: '✨', pos: 'bottom-[25%] left-[10%]', anim: 'anim-sparkle', delay: '4s' },
      { char: '🌻', pos: 'top-[15%] right-[12%]', anim: 'anim-float', delay: '1s' },
      { char: '🦋', pos: 'bottom-[35%] right-[4%]', anim: 'anim-float-r', delay: '5s' },
      { char: '💚', pos: 'top-[70%] left-[6%]', anim: 'anim-drift', delay: '2s' },
      { char: '🐝', pos: 'top-[40%] right-[2%]', anim: 'anim-float', delay: '3.5s' },
    ],
  },
  sky: {
    gradient: 'from-sky-50 via-lavender-50 to-cream-50',
    blobs: [
      { color: 'bg-sky-200/30', pos: 'top-0 right-1/4', size: 'w-80 h-80', delay: '0s' },
      { color: 'bg-blush-200/20', pos: 'bottom-0 left-1/4', size: 'w-72 h-72', delay: '4s' },
      { color: 'bg-lavender-200/25', pos: 'top-1/2 left-0', size: 'w-56 h-56', delay: '2s' },
    ],
    emojis: [
      { char: '☁️', pos: 'top-[8%] right-[10%]', anim: 'anim-float', delay: '0s' },
      { char: '💙', pos: 'bottom-[12%] left-[8%]', anim: 'anim-float-r', delay: '2s' },
      { char: '✨', pos: 'top-[20%] left-[5%]', anim: 'anim-sparkle', delay: '3s' },
      { char: '📦', pos: 'top-[40%] right-[3%]', anim: 'anim-drift', delay: '1s' },
      { char: '⭐', pos: 'bottom-[20%] right-[8%]', anim: 'anim-sparkle', delay: '4s' },
      { char: '🕊️', pos: 'top-[55%] left-[3%]', anim: 'anim-float', delay: '2.5s' },
      { char: '💫', pos: 'top-[10%] left-[20%]', anim: 'anim-sparkle', delay: '5s' },
      { char: '🌤️', pos: 'bottom-[30%] left-[15%]', anim: 'anim-float-r', delay: '1.5s' },
    ],
  },
  warm: {
    gradient: 'from-cream-100 via-blush-50 to-cream-50',
    blobs: [
      { color: 'bg-blush-200/25', pos: 'top-0 left-1/4', size: 'w-72 h-72', delay: '0s' },
      { color: 'bg-cream-200/30', pos: 'bottom-0 right-0', size: 'w-80 h-80', delay: '3s' },
      { color: 'bg-lavender-100/20', pos: 'top-1/3 right-1/3', size: 'w-64 h-64', delay: '6s' },
    ],
    emojis: [
      { char: '🧸', pos: 'top-[6%] right-[6%]', anim: 'anim-float', delay: '0s' },
      { char: '🎀', pos: 'bottom-[10%] left-[10%]', anim: 'anim-float-r', delay: '1.5s' },
      { char: '💖', pos: 'top-[25%] left-[3%]', anim: 'anim-sparkle', delay: '2s' },
      { char: '🛒', pos: 'top-[45%] right-[4%]', anim: 'anim-drift', delay: '3s' },
      { char: '🧶', pos: 'bottom-[25%] right-[8%]', anim: 'anim-float', delay: '4s' },
      { char: '✨', pos: 'top-[60%] left-[5%]', anim: 'anim-sparkle', delay: '1s' },
      { char: '🌸', pos: 'bottom-[40%] left-[3%]', anim: 'anim-float-r', delay: '5s' },
      { char: '💕', pos: 'top-[15%] left-[15%]', anim: 'anim-drift', delay: '2.5s' },
    ],
  },
  peach: {
    gradient: 'from-blush-50 via-cream-100 to-mint-50',
    blobs: [
      { color: 'bg-blush-300/20', pos: 'top-0 right-0', size: 'w-96 h-96', delay: '0s' },
      { color: 'bg-mint-200/25', pos: 'bottom-0 left-0', size: 'w-80 h-80', delay: '5s' },
      { color: 'bg-sky-100/20', pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', size: 'w-72 h-72', delay: '2s' },
    ],
    emojis: [
      { char: '🌻', pos: 'top-[5%] left-[8%]', anim: 'anim-float', delay: '0s' },
      { char: '💕', pos: 'bottom-[10%] right-[8%]', anim: 'anim-float-r', delay: '2s' },
      { char: '🧶', pos: 'top-[20%] right-[5%]', anim: 'anim-sparkle', delay: '1s' },
      { char: '🧸', pos: 'top-[40%] left-[2%]', anim: 'anim-drift', delay: '3s' },
      { char: '🌸', pos: 'bottom-[20%] left-[12%]', anim: 'anim-float', delay: '4s' },
      { char: '✨', pos: 'top-[55%] right-[3%]', anim: 'anim-sparkle', delay: '2.5s' },
      { char: '🎀', pos: 'bottom-[35%] right-[5%]', anim: 'anim-float-r', delay: '5s' },
      { char: '💝', pos: 'top-[70%] left-[5%]', anim: 'anim-drift', delay: '1.5s' },
      { char: '🌷', pos: 'top-[10%] right-[15%]', anim: 'anim-float', delay: '3.5s' },
      { char: '🦋', pos: 'bottom-[45%] left-[4%]', anim: 'anim-sparkle', delay: '4.5s' },
    ],
  },
  gold: {
    gradient: 'from-cream-100 via-cream-50 to-blush-50',
    blobs: [
      { color: 'bg-yellow-100/30', pos: 'top-0 left-0', size: 'w-80 h-80', delay: '0s' },
      { color: 'bg-blush-200/25', pos: 'bottom-0 right-1/4', size: 'w-72 h-72', delay: '4s' },
      { color: 'bg-lavender-100/20', pos: 'top-1/3 right-0', size: 'w-64 h-64', delay: '7s' },
    ],
    emojis: [
      { char: '⭐', pos: 'top-[6%] right-[8%]', anim: 'anim-sparkle', delay: '0s' },
      { char: '🌟', pos: 'bottom-[10%] left-[6%]', anim: 'anim-sparkle', delay: '2s' },
      { char: '🧸', pos: 'top-[25%] left-[4%]', anim: 'anim-float', delay: '1s' },
      { char: '✨', pos: 'top-[45%] right-[3%]', anim: 'anim-sparkle', delay: '3s' },
      { char: '💛', pos: 'bottom-[25%] right-[10%]', anim: 'anim-float-r', delay: '4s' },
      { char: '🏆', pos: 'top-[60%] left-[5%]', anim: 'anim-drift', delay: '2.5s' },
      { char: '🎁', pos: 'bottom-[35%] left-[3%]', anim: 'anim-float', delay: '5s' },
      { char: '💫', pos: 'top-[15%] left-[18%]', anim: 'anim-sparkle', delay: '1.5s' },
    ],
  },
};

export default function AnimatedBg({ theme = 'pink', children }: { theme?: keyof typeof THEMES; children: React.ReactNode }) {
  const t = THEMES[theme] || THEMES.pink;

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${t.gradient}`}>
      {/* Animated blob shapes */}
      {t.blobs.map((blob, i) => (
        <div key={i} className={`absolute ${blob.color} ${blob.pos} ${blob.size} rounded-full blur-[80px] anim-blob pointer-events-none`} style={{ animationDelay: blob.delay }} />
      ))}

      {/* Floating emojis — lots of them */}
      {t.emojis.map((e, i) => (
        <div key={i} className={`absolute ${e.pos} ${e.size || 'text-4xl'} opacity-[0.12] ${e.anim} pointer-events-none select-none`} style={{ animationDelay: e.delay }}>
          {e.char}
        </div>
      ))}

      {/* Content on top */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
