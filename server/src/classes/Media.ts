import { getMediaRepository, type MediaData } from '../models/index.js';

export class Media {
  private readonly _id: string;
  private readonly _s3Key: string;
  private readonly _s3Url: string;
  private readonly _cloudfrontUrl: string;
  private readonly _fileName: string;
  private readonly _mimeType: string;
  private readonly _size: number;
  private readonly _uploadedBy: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(data: MediaData) {
    this._id = data.id;
    this._s3Key = data.s3Key;
    this._s3Url = data.s3Url;
    this._cloudfrontUrl = data.cloudfrontUrl;
    this._fileName = data.fileName;
    this._mimeType = data.mimeType;
    this._size = data.size;
    this._uploadedBy = data.uploadedBy;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get s3Key(): string {
    return this._s3Key;
  }

  get s3Url(): string {
    return this._s3Url;
  }

  get cloudfrontUrl(): string {
    return this._cloudfrontUrl;
  }

  get fileName(): string {
    return this._fileName;
  }

  get mimeType(): string {
    return this._mimeType;
  }

  get size(): number {
    return this._size;
  }

  get uploadedBy(): string {
    return this._uploadedBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): MediaData {
    return {
      id: this._id,
      s3Key: this._s3Key,
      s3Url: this._s3Url,
      cloudfrontUrl: this._cloudfrontUrl,
      fileName: this._fileName,
      mimeType: this._mimeType,
      size: this._size,
      uploadedBy: this._uploadedBy,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static async create(data: {
    s3Key: string;
    s3Url: string;
    cloudfrontUrl: string;
    fileName: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
  }): Promise<Media> {
    const repo = await getMediaRepository();
    const mediaData = await repo.create(data);
    return new Media(mediaData);
  }

  static async findById(id: string): Promise<Media | null> {
    const repo = await getMediaRepository();
    const data = await repo.findById(id);
    return data ? new Media(data) : null;
  }

  static async findByUploadedBy(userId: string): Promise<Media[]> {
    const repo = await getMediaRepository();
    const records = await repo.findByUploadedBy(userId);
    return records.map((data) => new Media(data));
  }

  static async deleteById(id: string): Promise<void> {
    const repo = await getMediaRepository();
    await repo.deleteById(id);
  }

  static async deleteByUploadedBy(userId: string): Promise<void> {
    const repo = await getMediaRepository();
    await repo.deleteByUploadedBy(userId);
  }
}
