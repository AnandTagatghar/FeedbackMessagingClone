import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import sendVerificationCodeEmail from "@/utils/sendVerificationCodeEmail";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import verificationCodeDetails from "@/utils/generateVerificationDetails";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        identifier: { label: "Identifier", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        try {
          await dbConnect();

          const user = await UserModel.findOne({
            $or: [
              { username: credentials?.identifier },
              { email: credentials?.identifier },
            ],
          });

          if (!user) throw new Error(`User not found`);

          const { verifyCode, verifyCodeExpiry } = verificationCodeDetails;

          if (!user.isVerified) {
            process.env.NODE_ENV == "development"
              ? ""
              : await sendVerificationCodeEmail(
                  credentials?.identifier!,
                  verifyCode,
                  user.email
                );

            user.verifyCode = verifyCode;
            user.verifyCodeExpiry = verifyCodeExpiry;
            await user.save();

            throw new Error(`Please verify your email, otp send to your email`);
          }

          const isValid = await user.isPasswordCorrect(credentials?.password!);

          if (isValid) {
            return user;
          } else {
            throw new Error(`Invalid credentials`);
          }
        } catch (error: any) {
          throw new Error(error.message || `Error on authorize`);
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      if (account?.provider == "google") {
        const existingUser = await UserModel.findOne({
          email: user.email,
          provider: "google",
        });

        if (!existingUser) {
          await UserModel.create({
            provider: "google",
            username: user.name,
            email: user.email,
            isVerified: true,
          });
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      await dbConnect();

      if (account?.provider == "google") {
        const dbUser = await UserModel.findOne({
          email: token.email,
          provider: "google",
        });

        if (dbUser) {
          token._id = dbUser._id;
          token.username = dbUser.username;
          token.isAcceptingMessages = dbUser.isAcceptingMessages;
          token.isVerified = dbUser.isVerified;
        }
      } else if (user) {
        token._id = user._id;
        token.username = user.username;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.isVerified = user.isVerified;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.isVerified = token.isVerified;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/sign-in",
  },
};
