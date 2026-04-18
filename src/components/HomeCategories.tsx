'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COLORS = [
  'bg-blush-50 border-blush-200',
  'bg-lavender-50 border-lavender-200',
  'bg-mint-50 border-mint-200',
  'bg-sky-50 border-sky-200',
  'bg-cream-50 border-cream-200',
  'bg-blush-50 border-blush-200',
];

export default function HomeCategories() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCats = () => {
      fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    };
    fetchCats();
    const interval = setInterval(fetchCats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
      {categories.map((cat, i) => (
        <Link key={cat.slug} href={`/catalogo?category=${cat.slug}`}
          className={`${COLORS[i % COLORS.length]} border-2 rounded-cute p-6 text-center hover:shadow-warm hover:-translate-y-2 transition-all duration-300 group backdrop-blur-sm`}>
          <span className="text-5xl block mb-3 group-hover:scale-125 transition-transform duration-300">{cat.emoji}</span>
          <h3 className="font-display font-bold text-cocoa-700 mb-1">{cat.name}</h3>
        </Link>
      ))}
    </div>
  );
}
