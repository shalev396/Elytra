import type { IUserRepository } from './definitions/User.js';
import type { IMediaRepository } from './definitions/Media.js';
import { environment } from '../config/environment.js';

export type { UserData, IUserRepository } from './definitions/User.js';
export type { MediaData, IMediaRepository } from './definitions/Media.js';

let _userRepository: IUserRepository | null = null;
let _mediaRepository: IMediaRepository | null = null;

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

export async function getMediaRepository(): Promise<IMediaRepository> {
  if (_mediaRepository !== null) {
    return _mediaRepository;
  }

  if (environment.databaseProvider === 'mongoose') {
    const { MediaRepository } = await import('./mongoose/Media.js');
    _mediaRepository = MediaRepository;
  } else {
    const { MediaRepository } = await import('./sequelize/Media.js');
    _mediaRepository = MediaRepository;
  }

  return _mediaRepository;
}
