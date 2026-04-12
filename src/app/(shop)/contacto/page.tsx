'use client';

import { useEffect, useState } from 'react';
import AnimatedBg from '@/components/AnimatedBg';

const WA_NUMBER = '528187087288';
const WA_MSG = encodeURIComponent('Hola! Me interesa saber mas sobre sus creaciones de crochet 🧸');
const EMAIL = 'veroguadalupita@gmail.com';

const VALUES = [
  { emoji: '🧶', title: 'Artesanal 100%', desc: 'Cada puntada es hecha a mano, nunca usamos maquinas. Tu pieza es unica en el mundo.' },
  { emoji: '💝', title: 'Hecho con amor', desc: 'Ponemos corazon y dedicacion en cada creacion. Se nota en cada detalle.' },
  { emoji: '🌿', title: 'Materiales seguros', desc: 'Usamos hilos hipoalergenicos, lavables y seguros para bebes y ninos.' },
  { emoji: '✨', title: 'Piezas unicas', desc: 'No encontraras dos iguales. Cada producto tiene su propia personalidad.' },
];

const TIMELINE = [
  {
    year: '2024',
    title: 'Nace Mundo A Crochet',
    desc: 'Lo que comenzo como un hobby tejiendo amigurumis para familiares se convirtio en un emprendimiento real lleno de pasion y ternura.',
    emoji: '🧶',
    color: 'from-blush-400 to-blush-500',
    bg: 'bg-blush-50',
    border: 'border-blush-200',
    dot: 'bg-blush-400',
  },
  {
    year: '2025',
    title: 'Creciendo con amor',
    desc: 'La demanda crecio y empezamos a llegar a mas hogares. Cada pieza que creamos lleva un pedacito de nuestro corazon.',
    emoji: '🌟',
    color: 'from-lavender-400 to-lavender-500',
    bg: 'bg-lavender-50',
    border: 'border-lavender-200',
    dot: 'bg-lavender-400',
  },
  {
    year: '2026',
    title: 'Tienda en linea',
    desc: 'Lanzamos nuestra pagina web para llevar nuestras creaciones de crochet a todo Mexico. Un sueno hecho realidad!',
    emoji: '🚀',
    color: 'from-mint-400 to-mint-500',
    bg: 'bg-mint-50',
    border: 'border-mint-200',
    dot: 'bg-mint-400',
  },
  {
    year: '💕',
    title: 'El futuro',
    desc: 'Seguimos tejiendo suenos y creando piezas que llenan de ternura cada hogar. Lo mejor esta por venir!',
    emoji: '✨',
    color: 'from-sky-400 to-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    dot: 'bg-sky-400',
  },
];

// Base numbers (real clients before website)
const BASE_PIECES = 150;
const BASE_CLIENTS = 20;

export default function ContactPage() {
  const [stats, setStats] = useState({ itemsSold: 0, uniqueCustomers: 0, avgRating: 5, reviewCount: 0 });
  const [loaded, setLoaded] = useState(false);

  const fetchStats = () => {
    fetch('/api/stats').then(r => r.json()).then(d => { setStats(d); setLoaded(true); }).catch(() => setLoaded(true));
  };
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalPieces = BASE_PIECES + stats.itemsSold;
  const totalClients = BASE_CLIENTS + stats.uniqueCustomers;
  const rating = stats.reviewCount > 0 ? stats.avgRating : 5.0;

  return (
    <AnimatedBg theme="mint">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-mint-200 rounded-full px-4 py-1.5 mb-4">
          <span className="text-sm">🧶</span>
          <span className="text-xs font-bold text-cocoa-500">Conoce nuestra historia</span>
          <span className="text-sm">💕</span>
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">Sobre Nosotros</h1>
        <p className="text-cocoa-400 max-w-xl mx-auto leading-relaxed">
          Somos Mundo A Crochet, un emprendimiento artesanal de Monterrey dedicado a crear
          piezas unicas tejidas a mano con todo el amor y la ternura del mundo.
        </p>
      </div>

      {/* ═══ Story + Contact — side by side ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

        {/* Story card — decorated */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-bubble shadow-warm border border-cream-200 p-7 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blush-100/40 rounded-full blur-[40px] -mr-8 -mt-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-lavender-100/40 rounded-full blur-[30px] -ml-6 -mb-6" />

          <div className="relative">
            <h2 className="font-display font-bold text-xl text-cocoa-700 mb-4">Nuestra Historia 🧸</h2>
            <p className="text-cocoa-400 leading-relaxed mb-4">
              Todo comenzo con un par de agujas de crochet, un ovillo de estambre rosa
              y muchas ganas de crear algo bonito. Lo que empezo como un hobby en casa
              se fue convirtiendo en una verdadera pasion que hoy compartimos contigo.
            </p>
            <p className="text-cocoa-400 leading-relaxed mb-4">
              Desde Monterrey, Nuevo Leon, tejemos cada pieza con paciencia y carino.
              Nuestros amigurumis, accesorios y decoraciones nacen de horas de trabajo
              artesanal, usando los materiales mas suaves y seguros del mercado.
            </p>
            <p className="text-cocoa-400 leading-relaxed">
              Creemos que las cosas hechas a mano llevan un pedacito del alma de quien
              las crea. Por eso cada producto que sale de nuestras manos va cargado de
              amor, dedicacion y la ilusion de que te haga sonreir. 💕
            </p>
          </div>
        </div>

        {/* Contact card — decorated */}
        <div className="relative bg-gradient-to-br from-blush-50/80 to-lavender-50/80 backdrop-blur-sm rounded-bubble border border-blush-200 p-7 overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 bg-mint-100/40 rounded-full blur-[30px] -ml-6 -mt-6" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-blush-200/30 rounded-full blur-[40px] -mr-8 -mb-8" />

          <div className="relative">
            <h2 className="font-display font-bold text-xl text-cocoa-700 mb-4">Contactanos 💕</h2>
            <div className="space-y-4">
              <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 bg-white/70 rounded-2xl hover:bg-white/90 hover:shadow-soft transition-all group border border-white/50">
                <span className="text-2xl">📱</span>
                <div className="flex-1">
                  <span className="text-sm font-bold text-cocoa-600 group-hover:text-green-600 transition-colors">WhatsApp</span>
                  <p className="text-cocoa-400 text-xs">818 708 7288</p>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">Mensaje</span>
              </a>

              <a href={`mailto:${EMAIL}`}
                className="flex items-center gap-3 p-3.5 bg-white/70 rounded-2xl hover:bg-white/90 hover:shadow-soft transition-all group border border-white/50">
                <span className="text-2xl">📧</span>
                <div className="flex-1">
                  <span className="text-sm font-bold text-cocoa-600 group-hover:text-blush-400 transition-colors">Email</span>
                  <p className="text-cocoa-400 text-xs">{EMAIL}</p>
                </div>
                <span className="text-xs font-bold text-blush-400 bg-blush-50 px-2.5 py-1 rounded-full border border-blush-100">Escribir</span>
              </a>

              <div className="flex items-center gap-3 p-3.5 bg-white/50 rounded-2xl border border-white/50">
                <span className="text-2xl">📍</span>
                <div><span className="text-sm font-bold text-cocoa-600">Ubicacion</span><p className="text-cocoa-400 text-xs">Monterrey, Nuevo Leon, Mexico</p></div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-white/50 rounded-2xl border border-white/50">
                <span className="text-2xl">⏰</span>
                <div><span className="text-sm font-bold text-cocoa-600">Horario</span><p className="text-cocoa-400 text-xs">Lunes a Sabado 9:00 AM - 7:00 PM</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Our values ═══ */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Nuestros Valores 🌟</h2>
          <p className="text-cocoa-400 text-sm">Lo que nos hace diferentes</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VALUES.map(v => (
            <div key={v.title} className="relative bg-white/70 backdrop-blur-sm rounded-cute border border-cream-200 p-5 text-center shadow-soft hover:shadow-warm hover:-translate-y-1 transition-all overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blush-50/0 to-lavender-50/0 group-hover:from-blush-50/50 group-hover:to-lavender-50/50 transition-all duration-300" />
              <div className="relative">
                <span className="text-3xl block mb-2">{v.emoji}</span>
                <h3 className="font-display font-bold text-sm text-cocoa-700 mb-1">{v.title}</h3>
                <p className="text-xs text-cocoa-400 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Timeline — Nuestro Camino ═══ */}
      <div className="mb-12">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Nuestro Camino 🧶</h2>
          <p className="text-cocoa-400 text-sm">De un hobby a un sueno hecho realidad</p>
        </div>

        <div className="relative">
          {/* Animated gradient line */}
          <div className="absolute left-7 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-blush-300 via-lavender-300 via-60% to-mint-300 anim-gradient" />

          <div className="space-y-10">
            {TIMELINE.map((t, i) => (
              <div
                key={t.year}
                className="relative flex items-start gap-6 animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Pulse dot */}
                <div className="absolute left-7 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className={`absolute w-10 h-10 rounded-full ${t.dot} opacity-20 animate-ping`} style={{ animationDuration: '3s' }} />
                  <div className={`relative w-5 h-5 rounded-full bg-white border-[3px] shadow-lg flex items-center justify-center`} style={{ borderColor: `var(--tw-gradient-from, #FFB4B4)` }}>
                    <div className={`w-2 h-2 rounded-full ${t.dot}`} />
                  </div>
                </div>

                {/* Card — alternates sides on desktop */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2.5rem)] ${i % 2 === 0 ? '' : 'md:ml-auto'}`}>
                  <div className={`relative ${t.bg} backdrop-blur-sm rounded-2xl border ${t.border} p-6 shadow-soft hover:shadow-warm hover:-translate-y-1 transition-all duration-300 overflow-hidden group`}>
                    {/* Decorative corner blob */}
                    <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${t.dot} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
                    <div className={`absolute -bottom-3 -left-3 w-12 h-12 rounded-full ${t.dot} opacity-10 blur-lg group-hover:opacity-15 transition-opacity`} />

                    <div className="relative">
                      {/* Year badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-md`}>
                          <span className="text-lg">{t.emoji}</span>
                        </div>
                        <span className={`text-sm font-extrabold text-cocoa-700 tracking-wide`}>{t.year}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-cocoa-700 mb-2">{t.title}</h3>
                      <p className="text-sm text-cocoa-400 leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Live Numbers ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { num: `${totalPieces}+`, label: 'Piezas creadas', emoji: '🧸', accent: 'text-blush-500' },
          { num: `${totalClients}+`, label: 'Clientes felices', emoji: '😊', accent: 'text-lavender-500' },
          { num: '100%', label: 'Hecho a mano', emoji: '🧶', accent: 'text-mint-500' },
          { num: `${rating}⭐`, label: 'Calificacion', emoji: '💕', accent: 'text-amber-500' },
        ].map((s, i) => (
          <div key={s.label} className="relative bg-white/70 backdrop-blur-sm rounded-cute border border-cream-200 p-5 text-center shadow-soft hover:shadow-warm hover:-translate-y-1 transition-all overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-cream-100/0 group-hover:from-white/50 group-hover:to-cream-100/50 transition-all duration-300" />
            <div className="relative">
              <span className="text-2xl block mb-1">{s.emoji}</span>
              <p className={`font-display font-bold text-2xl ${s.accent} ${loaded ? 'animate-count-up' : ''}`}>{s.num}</p>
              <p className="text-xs text-cocoa-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ WhatsApp CTA — kept as is ═══ */}
      <div className="relative bg-gradient-to-r from-green-50/90 to-emerald-50/90 backdrop-blur-sm rounded-bubble p-8 text-center border border-green-200 shadow-warm overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-[50px] -mr-10 -mt-10" />
        <div className="relative">
          <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Escribenos por WhatsApp 📱</h2>
          <p className="text-cocoa-400 mb-6 max-w-md mx-auto">
            La forma mas rapida de contactarnos. Respondemos en menos de 2 horas durante horario de atencion.
          </p>
          <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`} target="_blank" rel="noopener noreferrer"
            className="btn-cute bg-green-500 text-white text-lg px-8 py-3 hover:bg-green-600 shadow-lg shadow-green-200 inline-flex items-center gap-2">
            💬 Abrir WhatsApp
          </a>
        </div>
      </div>

      {/* ═══ Custom orders CTA — kept as is ═══ */}
      <div className="relative bg-gradient-to-r from-blush-100/90 to-lavender-100/90 backdrop-blur-sm rounded-bubble p-8 text-center border border-blush-200 shadow-warm overflow-hidden">
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-lavender-200/30 rounded-full blur-[40px] -ml-8 -mb-8" />
        <div className="relative">
          <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Pedidos Personalizados 🧸</h2>
          <p className="text-cocoa-400 mb-6 max-w-md mx-auto">
            Quieres algo unico y especial? Cuentanos tu idea y la tejemos con amor para ti. Amigurumis, accesorios, decoracion — lo que imagines!
          </p>
          <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola! Quiero hacer un pedido personalizado de crochet 🧸')}`} target="_blank" rel="noopener noreferrer"
            className="btn-cute bg-blush-400 text-white px-8 py-3 hover:bg-blush-500 shadow-glow">
            Pedir algo especial 💕
          </a>
        </div>
      </div>

    </div>
    </AnimatedBg>
  );
}
