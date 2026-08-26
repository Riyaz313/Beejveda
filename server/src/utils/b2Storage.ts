import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { s3Client, BUCKET_NAME } from "../config/b2.js";
import { env } from "../config/env.js";

/**
 * Generate a presigned URL for reading a private B2 object.
 */
export async function getSignedImageUrl(
  key: string,
  expiresIn?: number
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: expiresIn ?? env.B2_SIGNED_URL_EXPIRY_SECONDS,
  });
}

/**
 * Upload a buffer to B2 and return the object key.
 */
export async function uploadToB2(
  buffer: Buffer,
  originalName: string,
  folder: string
): Promise<string> {
  const ext = originalName.split(".").pop() || "jpg";
  const key = `${folder}/${randomUUID()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: getContentType(ext),
    })
  );

  return key;
}

/**
 * Delete an object from B2.
 */
export async function deleteFromB2(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return types[ext.toLowerCase()] || "application/octet-stream";
}
