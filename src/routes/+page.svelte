<script lang="ts">
  let file: File | null = null
  let isUploading = false
  let uploadProgress = 0

  const resetState = () => ([file, isUploading, uploadProgress] = [null, false, 0])

  function handleFileChange(event: Event) {
    const { files } = event.target as HTMLInputElement
    if (files) {
      file = files[0]
    }
  }

  async function uploadFile() {
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      isUploading = true
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/upload')
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          uploadProgress = Math.round((e.loaded / e.total) * 100)
        }
      })
      xhr.send(formData)
      xhr.onload = resetState
    }
  }
</script>

<svelte:head>
  <title>File Drop</title>
  <meta
    name="description"
    content="FileDrop is a user-friendly web app that simplifies file sharing and uploading with a sleek drag-and-drop interface, multiple file uploads, and encryption for secure transfers."
  />
</svelte:head>

<h1>Upload your file</h1>

<hr />
<div
  on:dragover|preventDefault
  on:drop|preventDefault={(e) => {
    const draggedData = e.dataTransfer
    if (draggedData) {
      file = draggedData.files[0]
    }
  }}
>
  <label for="file">
    <div>
      <svg
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p>Click to upload or drag and drop</p>
    </div>
    <input hidden id="file" type="file" on:change={handleFileChange} />
  </label>
</div>
<hr />

{#if file}
  <button on:click={uploadFile} type="button">Upload File</button>
  {file.name}
  {#if isUploading}
    {uploadProgress}%
  {:else}
    <button aria-label="Remove File" on:click={() => (file = null)} title="Remove File" type="button">&Cross;</button>
  {/if}
{/if}
