import { z } from "zod";

export const sendMessageSchema = z.object({
  message: z.string().min(20).max(1500),
});
