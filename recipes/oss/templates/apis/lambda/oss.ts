import OSS from 'ali-oss';

export async function getUploadUrl(params: { filename: string }) {
  const { filename } = params;
  const dir = 'user-dir-prefix/'; // OSS 文件根目录
  
  const client = new OSS({
    region: '<oss region>', // 这里需要修改成你自己的 region
    accessKeyId: '<Your accessKeyId>',// 这里需要修改成你自己的 accessKeyId
    accessKeySecret: '<Your accessKeySecret>', // 这里需要修改成你自己的 accessKeySecret
    bucket: '<Your bucket name>', // 这里需要修改成你自己的 bucket
    secure: true,
  });

  const url = client.signatureUrl(dir + decodeURIComponent(filename), {
    method: 'PUT',
    'Content-Type': 'application/octet-stream',
  });

  return url;
}
