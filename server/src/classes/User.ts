import { getUserRepository, type UserData } from '../models/index.js';
import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { environment } from '../config/environment.js';

const cognitoClient = new CognitoIdentityProviderClient({
  region: environment.awsRegion,
});

export class User {
  private readonly _id: string;
  private readonly _cognitoSub: string;
  private readonly _name: string | null;
  private readonly _email: string | null;
  private readonly _lastLoginAt: Date | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(data: UserData) {
    this._id = data.id;
    this._cognitoSub = data.cognitoSub;
    this._name = data.name;
    this._email = data.email;
    this._lastLoginAt = data.lastLoginAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get cognitoSub(): string {
    return this._cognitoSub;
  }

  get name(): string | null {
    return this._name;
  }

  get email(): string | null {
    return this._email;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): UserData {
    return {
      id: this._id,
      cognitoSub: this._cognitoSub,
      name: this._name,
      email: this._email,
      lastLoginAt: this._lastLoginAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static async findById(id: string): Promise<User | null> {
    const repo = await getUserRepository();
    const data = await repo.findById(id);
    return data ? new User(data) : null;
  }

  static async findByCognitoSub(cognitoSub: string): Promise<User | null> {
    const repo = await getUserRepository();
    const data = await repo.findByCognitoSub(cognitoSub);
    return data ? new User(data) : null;
  }

  static async upsertFromLogin(
    cognitoSub: string,
    email: string | null,
    name: string | null,
  ): Promise<User> {
    const repo = await getUserRepository();
    const data = await repo.upsert({
      cognitoSub,
      email,
      name,
      lastLoginAt: new Date(),
    });
    return new User(data);
  }

  static async deleteAccount(userId: string, cognitoSub: string): Promise<void> {
    const repo = await getUserRepository();
    const user = await repo.findByCognitoSub(cognitoSub);

    if (user === null) {
      throw new Error('User not found');
    }

    try {
      const userPoolId = environment.cognitoUserPoolId;
      if (userPoolId !== undefined && userPoolId !== '') {
        await cognitoClient.send(
          new AdminDeleteUserCommand({
            UserPoolId: userPoolId,
            Username: cognitoSub,
          }),
        );
      } else {
        console.error('COGNITO_USER_POOL_ID not set, skipping Cognito deletion');
      }
    } catch (cognitoError) {
      console.error('Error deleting user from Cognito:', cognitoError);
    }

    await repo.deleteById(userId);
  }
}
