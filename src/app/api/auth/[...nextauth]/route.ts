import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Kiểm tra nếu URL là URL đăng nhập hoặc trang chủ, chuyển hướng đến trang reports
      if (url === baseUrl || url.startsWith(`${baseUrl}/`)) {
        const locale = url.split('/')[3] || 'en'; // Lấy locale từ URL
        return `${baseUrl}/${locale}/reports`;
      }
      return url;
    },
  },
});

export { handler as GET, handler as POST }; 