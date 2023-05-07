export function makeRequest<T>(method: string, url: string, data: any): Promise<T> {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(xhr.statusText)
      }
    }
    xhr.onerror = () => reject('Network error')
    xhr.send(data)
  })
}
