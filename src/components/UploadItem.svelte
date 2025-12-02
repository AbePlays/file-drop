<script lang="ts">
  import { onMount } from 'svelte'

  import type { CreateMultipartUploadCommandOutput, UploadPartCommandOutput } from '@aws-sdk/client-s3'
  import IconSuccess from '@components/IconSuccess.svelte'
  import IconWarning from '@components/IconWarning.svelte'
  import Loader from '@components/Loader.svelte'
  import { makeRequest } from '@utils/make-request'

  // Props
  export let clearFile: () => void
  export let file: File

  const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB
  const meta: { ETag: string; PartNumber: number }[] = []

  let status: 'pending' | 'resolved' | 'rejected' | 'cancelled' = 'pending'
  let uploadId: string = ''
  let uploadProgress = 0
  let xhr: XMLHttpRequest | null = null

  $: buttonLabel = status === 'pending' ? 'Cancel Upload' : 'Clear File'

  function handleCancel() {
    if (status === 'pending') {
      xhr?.abort()
      status = 'cancelled'
    } else {
      clearFile()
    }
  }

  async function initiateChunkedUpload() {
    const res = await makeRequest<CreateMultipartUploadCommandOutput>(
      'POST',
      'initiate-upload',
      JSON.stringify({ name: file.name })
    )
    if (res.UploadId) {
      uploadId = res.UploadId
      await createAndUploadChunk(res.UploadId, 0, 1)
    } else {
      status = 'rejected'
    }
  }

  async function createAndUploadChunk(uploadId: string, offset: number, partNumber: number) {
    // Create Chunk
    const chunk = file.slice(offset, offset + CHUNK_SIZE)

    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('name', file.name)
    formData.append('partNumber', partNumber.toString())
    formData.append('uploadId', uploadId)

    if (status === 'pending') {
      // Upload Chunk
      const res = await makeRequest<UploadPartCommandOutput>('POST', 'upload-part', formData)
      if (!res.ETag) {
        status = 'rejected'
        return
      }
      const totalParts = Math.ceil(file.size / CHUNK_SIZE)
      uploadProgress = Math.round((partNumber * 100) / totalParts)
      meta.push({ ETag: res.ETag, PartNumber: partNumber })
      const newOffset = offset + CHUNK_SIZE

      if (newOffset < file.size) {
        // Continue chunking and upload
        await createAndUploadChunk(uploadId, newOffset, partNumber + 1)
      } else {
        // Mark the upload complete
        await makeRequest('POST', 'complete-upload', JSON.stringify({ name: file.name, uploadId, meta }))
        status = 'resolved'
      }
    } else if (status === 'cancelled') {
      // Mark the upload cancelled
      await makeRequest('POST', 'abort-upload', JSON.stringify({ name: file.name, uploadId }))
    }
  }

  function uploadFileInOneGo() {
    const formData = new FormData()
    formData.append('file', file)

    xhr = new XMLHttpRequest()
    xhr.open('POST', 'upload-file')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadProgress = Math.round((e.loaded / e.total) * 100)
      }
    }
    xhr.send(formData)
    xhr.onload = () => (status = 'resolved')
  }

  onMount(() => {
    try {
      file.size > CHUNK_SIZE ? initiateChunkedUpload() : uploadFileInOneGo()
    } catch (e) {
      status = 'rejected'
    }
  })
</script>

<div class="border-1.5 border-gray-300 mt-4 rounded-lg max-w-lg mx-auto p-3 text-sm text-gray-500">
  <div class="flex items-start gap-3">
    {#if status === 'pending'}
      <Loader />
    {:else if ['rejected', 'cancelled'].includes(status)}
      <IconWarning />
    {:else}
      <IconSuccess />
    {/if}
    <div class="w-full">
      <div class="flex items-start justify-between gap-2 w-full">
        <div>
          <span class="font-medium line-clamp-1">
            {file.name}
          </span>
          <span class="block mt-0.5">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
        <button aria-label={buttonLabel} on:click={handleCancel} title={buttonLabel} type="button">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {#if status === 'pending'}
        <div class="mt-2 flex gap-3 items-center">
          <progress id="progress" max="100" value={uploadProgress}></progress>
          <label class="w-12 text-right" for="progress">{uploadProgress}%</label>
        </div>
      {:else if status === 'rejected'}
        <span class="mt-2 block">Failed to upload</span>
      {:else if status === 'cancelled'}
        <span class="mt-2 block">Cancelled</span>
      {/if}
    </div>
  </div>
</div>

<style>
  progress {
    border-radius: 9999px;
    width: 100%;
    height: 0.5rem;
  }
  progress::-webkit-progress-bar {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 9999px;
  }
  progress::-webkit-progress-value {
    background-color: rgb(107, 114, 128);
    border-radius: 9999px;
    transition: width 1s;
  }
  progress::-moz-progress-bar {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 9999px;
  }
</style>
