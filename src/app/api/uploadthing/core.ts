import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .onUploadComplete(async ({ file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for file:", file);
      
      // Return the file metadata
      return { 
        success: true, 
        file: {
          key: file.key,
          name: file.name,
          size: file.size,
          url: file.url,
        } 
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Create a singleton instance of UTApi
declare global {
  // eslint-disable-next-line no-var
  var utapi: UTApi | undefined;
}

const utapi = globalThis.utapi || new UTApi();

export { utapi };

if (process.env.NODE_ENV !== "production") {
  globalThis.utapi = utapi;
}
