import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { environment } from '../config/environment.js';

let client: jwksClient.JwksClient | null = null;

function getClient(): jwksClient.JwksClient {
  client ??= jwksClient({
    jwksUri: `${environment.cognitoIssuer}/.well-known/jwks.json`,
    cache: true,
    cacheMaxAge: 600000,
    cacheMaxEntries: 5,
  });

  return client;
}

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
  getClient().getSigningKey(header.kid, (err: Error | null, key?: jwksClient.SigningKey) => {
    if (err !== null) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyToken(token: string): Promise<jwt.JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: environment.cognitoIssuer,
        audience: environment.cognitoClientId,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err !== null) {
          reject(err);
        } else {
          resolve(decoded as jwt.JwtPayload);
        }
      },
    );
  });
}
