import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from './mongodb';
import User from '@/models/User';

const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || 'romanherrera548@gmail.com',
  'veroguadalupita@gmail.com',
];
const isAdminEmail = (email: string) => ADMIN_EMAILS.includes(email);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
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
      if (user) {
        token.role = (user as any).role || 'customer';
        token.id = (user as any).id;
      }

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
        }
      }

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
};
