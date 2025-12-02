import { env } from '$env/dynamic/private'
import { UploadPartCommand, S3Client } from '@aws-sdk/client-s3'
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
  const { chunk, name, partNumber, uploadId } = Object.fromEntries(await request.formData())

  if (
    typeof name === 'string' &&
    typeof uploadId === 'string' &&
    typeof partNumber === 'string' &&
    chunk instanceof Blob
  ) {
    const result = await S3.send(
      new UploadPartCommand({
        Bucket: 'file-drop',
        Key: name,
        UploadId: uploadId,
        PartNumber: Number(partNumber),
        Body: Buffer.from(await chunk.arrayBuffer())
      })
    )
    return json(result)
  }

  throw error(400, { message: 'Bad Request' })
}) satisfies RequestHandler
