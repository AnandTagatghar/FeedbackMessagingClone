import { resend } from "@/lib/resend";
import { brand_name } from "./constants";
import VerificationCodeEmail from "../../emails/VerificationEmail";

export default async function sendVerificationCodeEmail(
  username: string,
  otp: string,
  email: string
) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Verification Code | ${brand_name}`,
      react: VerificationCodeEmail({ username, otp }),
    });
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error
        ? error.message
        : `Error sending varification code email`
    );
  }
}
