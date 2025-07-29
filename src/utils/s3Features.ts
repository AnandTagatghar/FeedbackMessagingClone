import s3client from "@/lib/s3Client";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getObjectURL(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3client, command);
  return signedUrl;
}

export async function putObjectURL(ContentType: string, key: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType,
  });

  const signedUrl = await getSignedUrl(s3client, command, { expiresIn: 300 });
  return signedUrl;
}

export async function deleteObjectURL(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  await getSignedUrl(s3client, command);
}
