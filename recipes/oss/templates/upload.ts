import { getUploadUrl } from './apis/lambda/oss'

export async function uploadFile (e: any) {
  const file = e.target.files[0];
  const filename = encodeURIComponent(file.name);

  const url = await getUploadUrl({ filename });
  const contentType = 'application/octet-stream';
  const body = new Blob([file], { type: contentType });

  try {
    await fetch(url, {
      method: 'PUT',
      headers: new Headers({ 'Content-Type': contentType }),
      body,
    })
    console.log(`Upload successful! File path: ${url.substring(0, url.indexOf('?'))}`);
  } catch (err) {
    console.log(err);
  }
}
