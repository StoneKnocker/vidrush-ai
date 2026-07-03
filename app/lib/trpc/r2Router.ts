import { z } from "zod";
import { getUploadPreSignedUrl } from "~/lib/r2/r2.server";
import { publicProcedure, router } from "./init";

export const r2Router = router({
  getPresignedUrl: publicProcedure
    .input(
      z.object({
        filePath: z.string().min(1),
        contentType: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const uploadUrl = await getUploadPreSignedUrl(
        input.filePath,
        input.contentType,
      );
      return { uploadUrl, key: input.filePath };
    }),
});
