import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import prisma from "./prisma";
import { admin } from "better-auth/plugins";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      joins: true, // Enables joins for 2x–3x performance improvement on session fetches
    },
  },
  plugins: [admin()],
});
