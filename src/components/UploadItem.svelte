<script lang="ts">
  import { onMount } from 'svelte'

  import IconSuccess from './IconSuccess.svelte'
  import IconWarning from './IconWarning.svelte'
  import Loader from './Loader.svelte'

  // Props
  export let clearFile: () => void
  export let file: File

  let status: 'pending' | 'resolved' | 'rejected' | 'cancelled' = 'pending'
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

  onMount(() => {
    const formData = new FormData()
    formData.append('file', file)

    xhr = new XMLHttpRequest()
    xhr.open('POST', '/upload')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadProgress = Math.round((e.loaded / e.total) * 100)
      }
    }
    xhr.send(formData)
    xhr.onload = () => (status = 'resolved')
    xhr.onerror = () => (status = 'rejected')
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
          <progress id="progress" max="100" value={uploadProgress} />
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
