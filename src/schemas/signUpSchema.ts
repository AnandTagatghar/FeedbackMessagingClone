import { z } from "zod";

export const usernameValidationSchema = z
  .string()
  .min(2, `Accepting atleast 2 characters`)
  .max(20, `Accepting atmost 20 characters`)
  .regex(
    /^[a-zA-Z0-9_]+$/,
    `Accepting only characters and numbers, please don't provide username with special characters`
  );

export const signUpSchema = z.object({
  username: usernameValidationSchema,
  email: z.email(),
  password: z.string().min(6),
});
