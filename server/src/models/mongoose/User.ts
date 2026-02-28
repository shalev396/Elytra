import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { type UserData, type IUserRepository, USER_TABLE_NAME } from '../definitions/User.js';

interface UserFields {
  _id: string;
  cognitoSub: string;
  name: string | null;
  email: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type UserDocument = mongoose.Document<string> & UserFields;

const userSchema = new mongoose.Schema<UserDocument>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    cognitoSub: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
      index: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: USER_TABLE_NAME,
  },
);

const UserMongoModel = mongoose.model<UserDocument>('User', userSchema);

function toUserData(doc: UserDocument): UserData {
  return {
    id: doc._id,
    cognitoSub: doc.cognitoSub,
    name: doc.name,
    email: doc.email,
    lastLoginAt: doc.lastLoginAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const UserRepository: IUserRepository = {
  async findById(id: string): Promise<UserData | null> {
    const doc = await UserMongoModel.findById(id);
    return doc ? toUserData(doc) : null;
  },

  async findByCognitoSub(sub: string): Promise<UserData | null> {
    const doc = await UserMongoModel.findOne({ cognitoSub: sub });
    return doc ? toUserData(doc) : null;
  },

  async upsert(data: {
    cognitoSub: string;
    email: string | null;
    name: string | null;
    lastLoginAt: Date;
  }): Promise<UserData> {
    const doc = await UserMongoModel.findOneAndUpdate(
      { cognitoSub: data.cognitoSub },
      {
        $set: {
          email: data.email,
          name: data.name,
          lastLoginAt: data.lastLoginAt,
        },
        $setOnInsert: {
          _id: uuidv4(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return toUserData(doc);
  },

  async deleteById(id: string): Promise<void> {
    await UserMongoModel.findByIdAndDelete(id);
  },
};

export { UserMongoModel };
export default UserRepository;
