import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Log env var status at startup (only names, never values)
const envCheck = {
  NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  MONGODB_URI: !!process.env.MONGODB_URI,
  ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
};
console.log('[NextAuth] Environment check:', envCheck);

if (!process.env.NEXTAUTH_SECRET) {
  console.error('[NextAuth] CRITICAL: NEXTAUTH_SECRET is missing! Auth will not work.');
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
