import { UserModel } from './User.js';
import { MediaModel } from './Media.js';

/**
 * Defines all Sequelize associations between models.
 * Must be called after all models are initialized and before sync.
 */
export function defineAssociations(): void {
  // User hasOne Media as photo (User.photoId -> Media.id)
  UserModel.belongsTo(MediaModel, {
    foreignKey: 'photoId',
    as: 'photo',
    constraints: false,
  });
  MediaModel.hasOne(UserModel, {
    foreignKey: 'photoId',
    as: 'photoOwner',
    constraints: false,
  });

  // Media belongsTo User via uploadedBy (Media.uploadedBy -> User.id)
  MediaModel.belongsTo(UserModel, {
    foreignKey: 'uploadedBy',
    as: 'uploader',
  });
  UserModel.hasMany(MediaModel, {
    foreignKey: 'uploadedBy',
    as: 'uploads',
  });
}
