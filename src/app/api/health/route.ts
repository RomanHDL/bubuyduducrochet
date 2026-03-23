import { NextResponse } from 'next/server';

export async function GET() {
  const env = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '(not set)',
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '(not set)',
    NODE_ENV: process.env.NODE_ENV || '(not set)',
  };

  const missing = Object.entries(env)
    .filter(([key, val]) => val === false)
    .map(([key]) => key);

  let mongoStatus = 'not tested';
  if (process.env.MONGODB_URI) {
    try {
      const { connectDB } = await import('@/lib/mongodb');
      await connectDB();
      mongoStatus = 'connected';
    } catch (err: any) {
      mongoStatus = `error: ${err.message}`;
    }
  } else {
    mongoStatus = 'MONGODB_URI not set';
  }

  return NextResponse.json({
    status: missing.length === 0 ? 'ok' : 'missing variables',
    env,
    missing,
    mongoStatus,
    timestamp: new Date().toISOString(),
  });
}
