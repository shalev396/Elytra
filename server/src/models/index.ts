import type { IUserRepository } from './definitions/User.js';
import { environment } from '../config/environment.js';

export type { UserData, IUserRepository } from './definitions/User.js';

let _userRepository: IUserRepository | null = null;

export async function getUserRepository(): Promise<IUserRepository> {
  if (_userRepository !== null) {
    return _userRepository;
  }

  if (environment.databaseProvider === 'mongoose') {
    const { UserRepository } = await import('./mongoose/User.js');
    _userRepository = UserRepository;
  } else {
    const { UserRepository } = await import('./sequelize/User.js');
    _userRepository = UserRepository;
  }

  return _userRepository;
}
