export interface UserData {
  id: string;
  cognitoSub: string;
  name: string | null;
  email: string | null;
  photoId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository {
  findById(id: string): Promise<UserData | null>;
  findByCognitoSub(sub: string): Promise<UserData | null>;
  upsert(data: {
    cognitoSub: string;
    email: string | null;
    name: string | null;
    lastLoginAt: Date;
  }): Promise<UserData>;
  updateProfile(id: string, data: { name?: string; photoId?: string | null }): Promise<UserData>;
  deleteById(id: string): Promise<void>;
}

export const USER_TABLE_NAME = 'Users';
