declare module 'react-s3' {
    interface S3Config {
      bucketName: string;
      dirName?: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    }
  
    interface UploadFileResponse {
      bucket: string;
      key: string;
      location: string;
      status: string;
    }
  
    export function uploadFile(
      file: File | Blob,
      config: S3Config
    ): Promise<UploadFileResponse>;
  }