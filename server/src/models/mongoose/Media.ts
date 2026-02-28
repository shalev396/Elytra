import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { type MediaData, type IMediaRepository, MEDIA_TABLE_NAME } from '../definitions/Media.js';

interface MediaFields {
  _id: string;
  s3Key: string;
  s3Url: string;
  cloudfrontUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type MediaDocument = mongoose.Document<string> & MediaFields;

const mediaSchema = new mongoose.Schema<MediaDocument>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    s3Key: {
      type: String,
      required: true,
      unique: true,
    },
    s3Url: {
      type: String,
      required: true,
    },
    cloudfrontUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: MEDIA_TABLE_NAME,
  },
);

// Media belongsTo User via uploadedBy (uploadedBy -> User._id)
mediaSchema.virtual('uploader', {
  ref: 'User',
  localField: 'uploadedBy',
  foreignField: '_id',
  justOne: true,
});

const MediaMongoModel = mongoose.model<MediaDocument>('Media', mediaSchema);

function toMediaData(doc: MediaDocument): MediaData {
  return {
    id: doc._id,
    s3Key: doc.s3Key,
    s3Url: doc.s3Url,
    cloudfrontUrl: doc.cloudfrontUrl,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    size: doc.size,
    uploadedBy: doc.uploadedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const MediaRepository: IMediaRepository = {
  async create(data: {
    s3Key: string;
    s3Url: string;
    cloudfrontUrl: string;
    fileName: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
  }): Promise<MediaData> {
    const doc = await MediaMongoModel.create({
      _id: uuidv4(),
      ...data,
    });
    return toMediaData(doc);
  },

  async findById(id: string): Promise<MediaData | null> {
    const doc = await MediaMongoModel.findById(id);
    return doc ? toMediaData(doc) : null;
  },

  async findByUploadedBy(userId: string): Promise<MediaData[]> {
    const docs = await MediaMongoModel.find({ uploadedBy: userId });
    return docs.map(toMediaData);
  },

  async deleteById(id: string): Promise<void> {
    await MediaMongoModel.findByIdAndDelete(id);
  },

  async deleteByUploadedBy(userId: string): Promise<void> {
    await MediaMongoModel.deleteMany({ uploadedBy: userId });
  },
};

export { MediaMongoModel };
export default MediaRepository;
