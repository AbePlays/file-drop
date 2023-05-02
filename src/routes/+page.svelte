<script lang="ts">
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

<h1>Upload your files</h1>

<hr />
<div
  on:dragover|preventDefault
  on:drop|preventDefault={(e) => {
    const draggedData = e.dataTransfer
    if (draggedData) {
      fileList = Array.from(draggedData.files)
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
    <input hidden id="file" type="file" multiple on:change={handleFileChange} />
  </label>
</div>
<hr />

<h2>Files Selected: {fileList.length}</h2>
{#if fileList.length}
  <ul>
    {#each fileList as file}
      <li>
        {file.name}
      </li>
    {/each}
  </ul>
{/if}
