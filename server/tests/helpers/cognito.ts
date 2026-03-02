import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';

let client: CognitoIdentityProviderClient | null = null;

function getClient(): CognitoIdentityProviderClient {
  if (client === null) {
    const region = process.env.AWS_REGION;
    if (!region) {
      throw new Error('AWS_REGION environment variable is required');
    }
    client = new CognitoIdentityProviderClient({ region });
  }
  return client;
}

function getUserPoolId(): string {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  if (!userPoolId) {
    throw new Error('COGNITO_USER_POOL_ID environment variable is required');
  }
  return userPoolId;
}

export async function clearAllCognitoUsers(): Promise<void> {
  const userPoolId = getUserPoolId();
  let paginationToken: string | undefined;

  console.log('[Cognito] Clearing all users from pool...');

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

  console.log(`[Cognito] Cleared ${String(totalDeleted)} users`);
}
