export interface MediaData {
  /** Unique identifier — used to link media to other models (e.g. User.photoId -> Media.id) */
  id: string;
  /** S3 object key path, used internally for SDK operations like delete (e.g. "media/users/{uid}/{uuid}.jpg") */
  s3Key: string;
  /** Full S3 bucket URL for this file (e.g. "https://bucket.s3.region.amazonaws.com/media/users/{uid}/{uuid}.jpg") */
  s3Url: string;
  /** Full CloudFront distribution URL — this is what the frontend fetches (e.g. "https://domain.com/media/users/{uid}/{uuid}.jpg") */
  cloudfrontUrl: string;
  /** Original file name as uploaded by the user (e.g. "my-photo.jpg") */
  fileName: string;
  /** MIME type — used to set Content-Type on S3 so browsers render the file correctly (e.g. "image/jpeg", "image/png") */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** User ID of whoever uploaded this file — references the Users table */
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMediaRepository {
  create(data: {
    s3Key: string;
    s3Url: string;
    cloudfrontUrl: string;
    fileName: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
  }): Promise<MediaData>;
  findById(id: string): Promise<MediaData | null>;
  findByUploadedBy(userId: string): Promise<MediaData[]>;
  deleteById(id: string): Promise<void>;
  deleteByUploadedBy(userId: string): Promise<void>;
}

export const MEDIA_TABLE_NAME = 'Media';
