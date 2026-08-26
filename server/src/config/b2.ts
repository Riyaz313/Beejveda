import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

export const s3Client = new S3Client({
  region: env.B2_REGION,
  endpoint: env.B2_ENDPOINT,
  credentials: {
    accessKeyId: env.B2_KEY_ID,
    secretAccessKey: env.B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
});

export const BUCKET_NAME = env.B2_BUCKET_NAME;
