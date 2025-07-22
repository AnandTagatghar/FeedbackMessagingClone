import { Resend } from "resend";

export const resend = new Resend(process.env.NEXTAUTH_SECRET);
