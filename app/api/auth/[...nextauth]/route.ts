/**
 * 🔐 NEXTAUTH CONFIGURATION
 * Authentication setup for the application
 */

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/database/database';
import { NextAuthOptions } from 'next-auth';

// Extend the Session type for TypeScript
declare module 'next-auth' {
  interface User {
    role?: string;
    subscriptionTier?: string;
  }
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
      role?: string;
      subscriptionTier?: string;
    }
  }
}

// Extend JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    subscriptionTier?: string;
  }
}

// Auth options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // For development purposes, use hardcoded demo credentials
          if (credentials.email === 'demo@nexural.com' && credentials.password === 'demo123') {
            return {
              id: 'user_demo',
              email: 'demo@nexural.com',
              name: 'Demo User',
              role: 'user',
              subscriptionTier: 'pro'
            };
          }

          if (credentials.email === 'admin@nexural.com' && credentials.password === 'admin123') {
            return {
              id: 'user_admin',
              email: 'admin@nexural.com',
              name: 'Admin User',
              role: 'admin',
              subscriptionTier: 'enterprise'
            };
          }

          // Try to find user in database as a fallback
          const queryResult = await db.query(
            `SELECT * FROM users WHERE email = $1 LIMIT 1`,
            [credentials.email]
          );

          const user = queryResult.rows[0];
          if (!user) {
            return null;
          }

          // For development, accept any password for database users
          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`.trim(),
            role: user.role || 'user',
            subscriptionTier: user.subscription_tier || 'free'
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.subscriptionTier = user.subscriptionTier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.subscriptionTier = token.subscriptionTier;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
