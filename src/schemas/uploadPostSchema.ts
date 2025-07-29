import { z } from "zod";

export const uploadPostSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(100),
  files: z.any(),
  githubLink: z.url().optional(),
  projectLink:z.url().optional()
});
