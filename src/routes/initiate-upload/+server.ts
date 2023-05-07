import { env } from '$env/dynamic/private'
import { CreateMultipartUploadCommand, S3Client } from '@aws-sdk/client-s3'
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
  const { name } = await request.json()

  if (typeof name === 'string') {
    const result = await S3.send(new CreateMultipartUploadCommand({ Bucket: 'file-drop', Key: name }))
    return json(result)
  }

  throw error(400, { message: 'Bad Request' })
}) satisfies RequestHandler
