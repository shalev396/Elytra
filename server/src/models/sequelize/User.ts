import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../../config/providers/sequelize.js';
import { type UserData, type IUserRepository, USER_TABLE_NAME } from '../definitions/User.js';

class UserModel extends Model {
  declare id: string;
  declare cognitoSub: string;
  declare name: string | null;
  declare email: string | null;
  declare lastLoginAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

const sequelize = getSequelize();

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cognitoSub: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: USER_TABLE_NAME,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['cognitoSub'],
      },
      {
        fields: ['email'],
      },
    ],
  },
);

function toUserData(model: UserModel): UserData {
  return {
    id: model.id,
    cognitoSub: model.cognitoSub,
    name: model.name,
    email: model.email,
    lastLoginAt: model.lastLoginAt,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export const UserRepository: IUserRepository = {
  async findById(id: string): Promise<UserData | null> {
    const user = await UserModel.findByPk(id);
    return user ? toUserData(user) : null;
  },

  async findByCognitoSub(sub: string): Promise<UserData | null> {
    const user = await UserModel.findOne({ where: { cognitoSub: sub } });
    return user ? toUserData(user) : null;
  },

  async upsert(data: {
    cognitoSub: string;
    email: string | null;
    name: string | null;
    lastLoginAt: Date;
  }): Promise<UserData> {
    const [record] = await UserModel.upsert({
      cognitoSub: data.cognitoSub,
      email: data.email,
      name: data.name,
      lastLoginAt: data.lastLoginAt,
    });
    return toUserData(record);
  },

  async deleteById(id: string): Promise<void> {
    await UserModel.destroy({ where: { id } });
  },
};

export { UserModel };
export default UserRepository;
