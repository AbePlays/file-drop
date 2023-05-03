<script lang="ts">
  import '@unocss/reset/tailwind.css'
  import 'uno.css'

  import UploadItem from '../components/UploadItem.svelte'

  let fileList: File[] = []

  function handleFileChange(event: Event) {
    const { files } = event.target as HTMLInputElement
    if (files) {
      fileList = Array.from(files)
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

<header class="text-center py-3 border-b text-gray-500">FileDrop</header>
<main class="px-4 py-8">
  <div
    class="max-w-lg mx-auto"
    on:dragover|preventDefault
    on:drop|preventDefault={(e) => {
      const draggedData = e.dataTransfer
      if (draggedData) {
        fileList = Array.from(draggedData.files)
      }
    }}
  >
    <label
      for="file"
      class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed transition-colors duration-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
    >
      <svg
        aria-hidden="true"
        class="w-10 h-10 mb-3 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p class="mb-2 text-sm text-gray-500">
        <span class="font-semibold">Click to upload</span> or drag and drop
      </p>
    </label>
    <input class="sr-only" id="file" multiple type="file" on:change={handleFileChange} />
  </div>

  {#if fileList.length}
    {#each fileList as file (file.name)}
      <UploadItem clearFile={() => (fileList = fileList.filter((item) => item !== file))} {file} />
    {/each}
  {/if}
</main>
