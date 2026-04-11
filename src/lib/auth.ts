import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
import User from '@/models/User';

const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || 'romanherrera548@gmail.com',
  'veroguadalupita@gmail.com',
];
const isAdminEmail = (email: string) => ADMIN_EMAILS.includes(email);

/* ── Build providers list conditionally ── */
const providers: NextAuthOptions['providers'] = [];

// Only add Google if both credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  console.warn('[NextAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing — Google login disabled');
}

// Always add Credentials provider
providers.push(
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      try {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
          role: user.role,
        };
      } catch (err) {
        console.error('[NextAuth] Credentials authorize error:', err);
        return null;
      }
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          const existing = await User.findOne({ email: user.email });

          if (!existing) {
            const role = isAdminEmail(user.email || '') ? 'admin' : 'customer';
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: 'google',
              role,
            });
          } else if (isAdminEmail(existing.email) && existing.role !== 'admin') {
            existing.role = 'admin';
            await existing.save();
          }
        } catch (err) {
          console.error('[NextAuth] signIn callback error:', err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // On initial sign in, attach role from the user object
      if (user) {
        token.role = (user as any).role || 'customer';
        token.id = (user as any).id;
      }

      // Sync role from DB — but don't crash if MongoDB is down
      if (token.email && !token.role) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
          }
        } catch (err) {
          console.error('[NextAuth] jwt callback DB error:', err);
          // Don't crash — use whatever role we already have
        }
      }

      // Always ensure admin emails get admin role
      if (isAdminEmail(token.email || '')) {
        token.role = 'admin';
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || 'customer';
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
