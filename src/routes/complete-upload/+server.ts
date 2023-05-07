import { env } from '$env/dynamic/private'
import { CompleteMultipartUploadCommand, S3Client } from '@aws-sdk/client-s3'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY
  }
})

export const POST = (async ({ request }) => {
  const { name, meta, uploadId } = await request.json()

  if (typeof name === 'string' && typeof uploadId === 'string' && Array.isArray(meta)) {
    const result = await S3.send(
      new CompleteMultipartUploadCommand({
        Bucket: 'file-drop',
        Key: name,
        UploadId: uploadId,
        MultipartUpload: { Parts: meta }
      })
    )
    return json(result)
  }

  throw error(400, { message: 'Bad Request' })
}) satisfies RequestHandler
