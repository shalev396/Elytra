import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { environment } from '../config/environment.js';

let client: CognitoIdentityProviderClient | null = null;

function getClient(): CognitoIdentityProviderClient {
  client ??= new CognitoIdentityProviderClient({ region: environment.awsRegion });
  return client;
}

export async function clearAllCognitoUsers(): Promise<void> {
  const userPoolId = environment.cognitoUserPoolId;
  if ((userPoolId ?? '') === '') {
    throw new Error('COGNITO_USER_POOL_ID is not set');
  }

  let paginationToken: string | undefined;
  let totalDeleted = 0;

  do {
    const response = await getClient().send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        PaginationToken: paginationToken,
      }),
    );

    const users = response.Users ?? [];

    for (const user of users) {
      const username = user.Username;
      if (username !== undefined && username !== '') {
        try {
          await getClient().send(
            new AdminDeleteUserCommand({
              UserPoolId: userPoolId,
              Username: username,
            }),
          );
          totalDeleted++;
        } catch (error) {
          if (error instanceof Error && error.name !== 'UserNotFoundException') {
            console.error(`[Cognito] Failed to delete user ${username}: ${error.message}`);
          }
        }
      }
    }

    paginationToken = response.PaginationToken;
  } while (paginationToken !== undefined && paginationToken !== '');

  if (totalDeleted > 0) {
    console.warn(`[Cognito] Cleared ${String(totalDeleted)} users`);
  }
}
