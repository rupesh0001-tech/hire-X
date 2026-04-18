import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_public || '',
  privateKey: process.env.IMAGE_KIT_PRIVATE || '',
  urlEndpoint: 'https://ik.imagekit.io/builtforjob',
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
