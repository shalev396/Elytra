import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../../config/providers/sequelize.js';
import { type MediaData, type IMediaRepository, MEDIA_TABLE_NAME } from '../definitions/Media.js';
import { USER_TABLE_NAME } from '../definitions/User.js';

class MediaModel extends Model {
  declare id: string;
  declare s3Key: string;
  declare s3Url: string;
  declare cloudfrontUrl: string;
  declare fileName: string;
  declare mimeType: string;
  declare size: number;
  declare uploadedBy: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

const sequelize = getSequelize();

MediaModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    s3Url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cloudfrontUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: USER_TABLE_NAME,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: MEDIA_TABLE_NAME,
    timestamps: true,
    indexes: [
      {
        fields: ['uploadedBy'],
      },
      {
        unique: true,
        fields: ['s3Key'],
      },
    ],
  },
);

function toMediaData(model: MediaModel): MediaData {
  return {
    id: model.id,
    s3Key: model.s3Key,
    s3Url: model.s3Url,
    cloudfrontUrl: model.cloudfrontUrl,
    fileName: model.fileName,
    mimeType: model.mimeType,
    size: model.size,
    uploadedBy: model.uploadedBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
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
    const record = await MediaModel.create(data);
    return toMediaData(record);
  },

  async findById(id: string): Promise<MediaData | null> {
    const record = await MediaModel.findByPk(id);
    return record ? toMediaData(record) : null;
  },

  async findByUploadedBy(userId: string): Promise<MediaData[]> {
    const records = await MediaModel.findAll({ where: { uploadedBy: userId } });
    return records.map(toMediaData);
  },

  async deleteById(id: string): Promise<void> {
    await MediaModel.destroy({ where: { id } });
  },

  async deleteByUploadedBy(userId: string): Promise<void> {
    await MediaModel.destroy({ where: { uploadedBy: userId } });
  },
};

export { MediaModel };
export default MediaRepository;
