import { z } from "zod";

export const editFileSchema = z.object({
  file: z
    .any()
});
