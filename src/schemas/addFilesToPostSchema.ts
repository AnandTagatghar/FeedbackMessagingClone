import { z } from "zod";

export const addFilesToPostSchema = z.object({
  files: z.instanceof(FileList).refine((files) => files.length > 0, {
    message: "At least one file is required",
  }),
});
