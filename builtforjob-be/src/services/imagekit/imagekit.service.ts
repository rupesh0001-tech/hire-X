import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export interface UploadResult {
  url: string;
  fileId: string;
  name: string;
}

export class ImageKitService {
  static async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folder: string = '/companies'
  ): Promise<UploadResult> {
    const base64 = fileBuffer.toString('base64');

    const response = await imagekit.upload({
      file: base64,
      fileName,
      folder,
      useUniqueFileName: true,
    });

    return {
      url: response.url,
      fileId: response.fileId,
      name: response.name,
    };
  }

  static async deleteFile(fileId: string): Promise<void> {
    await imagekit.deleteFile(fileId);
  }
}
