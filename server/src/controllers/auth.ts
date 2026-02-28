import { type RequestHandler } from 'express';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import jwt from 'jsonwebtoken';
import { User } from '../classes/index.js';
import { environment } from '../config/environment.js';
import type { CognitoJwtPayload } from '../types/express.js';
import type {
  SignupRequestBody,
  SignupResponseData,
  ConfirmSignupRequestBody,
  LoginRequestBody,
  LoginResponseData,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
  RefreshTokenRequestBody,
  RefreshTokenResponseData,
} from '../routes/auth/index.js';

const cognitoClient = new CognitoIdentityProviderClient({
  region: environment.awsRegion,
});

const signup: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password, name } = req.body as SignupRequestBody;

    if (!email || !password || !name) {
      res.error('Email, password, and name are required', 400);
      return;
    }

    const clientId = environment.cognitoClientId;

    const result = await cognitoClient.send(
      new SignUpCommand({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name },
        ],
      }),
    );

    const data: SignupResponseData = {
      userSub: result.UserSub ?? '',
      userConfirmed: result.UserConfirmed ?? false,
    };

    res.success(data);
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    res.error(errorMessage, 400);
  }
};

const confirmSignup: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, code } = req.body as ConfirmSignupRequestBody;

    if (!email || !code) {
      res.error('Email and verification code are required', 400);
      return;
    }

    const clientId = environment.cognitoClientId;

    await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
      }),
    );

    res.success({});
  } catch (error) {
    console.error('Confirmation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
    res.error(errorMessage, 400);
  }
};

const login: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequestBody;

    if (!email || !password) {
      res.error('Email and password are required', 400);
      return;
    }

    const clientId = environment.cognitoClientId;

    const result = await cognitoClient.send(
      new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    );

    const idToken = result.AuthenticationResult?.IdToken;
    const refreshToken = result.AuthenticationResult?.RefreshToken;
    const expiresIn = result.AuthenticationResult?.ExpiresIn;

    if (idToken === undefined) {
      throw new Error('No ID token received from Cognito');
    }

    const decoded = jwt.decode(idToken) as CognitoJwtPayload | null;
    if (decoded === null) {
      throw new Error('Invalid token: missing sub claim');
    }

    const cognitoSub = decoded.sub;
    const userEmail = decoded.email ?? null;
    const userName = decoded.name ?? null;

    const user = await User.upsertFromLogin(cognitoSub, userEmail, userName);

    const data: LoginResponseData = {
      user: {
        id: user.cognitoSub,
        email: user.email ?? '',
        name: user.name ?? '',
      },
      tokens: {
        idToken,
        refreshToken: refreshToken ?? '',
        expiresIn: expiresIn ?? 3600,
      },
    };

    res.success(data);
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    res.error(errorMessage, 401);
  }
};

const forgotPassword: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email } = req.body as ForgotPasswordRequestBody;

    if (!email) {
      res.error('Email is required', 400);
      return;
    }

    const clientId = environment.cognitoClientId;

    await cognitoClient.send(
      new ForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
      }),
    );

    res.success({});
  } catch (error: unknown) {
    console.error('Forgot password error:', error);

    if (error instanceof Error) {
      if (error.name === 'UserNotFoundException') {
        res.success({});
        return;
      }

      if (error.name === 'LimitExceededException') {
        res.error('Too many requests. Please try again later.', 429);
        return;
      }
    }

    res.error('Failed to initiate password reset. Please try again.', 500);
  }
};

const resetPassword: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, code, password } = req.body as ResetPasswordRequestBody;

    if (!email || !code || !password) {
      res.error('Email, verification code, and new password are required', 400);
      return;
    }

    const clientId = environment.cognitoClientId;

    await cognitoClient.send(
      new ConfirmForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
        Password: password,
      }),
    );

    res.success({});
  } catch (error: unknown) {
    console.error('Reset password error:', error);

    if (error instanceof Error) {
      if (error.name === 'CodeMismatchException') {
        res.error('Invalid verification code. Please check and try again.', 400);
        return;
      }

      if (error.name === 'ExpiredCodeException') {
        res.error('Verification code has expired. Please request a new one.', 400);
        return;
      }

      if (error.name === 'InvalidPasswordException') {
        res.error(
          'Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, number, and special character.',
          400,
        );
        return;
      }

      if (error.name === 'LimitExceededException') {
        res.error('Too many attempts. Please try again later.', 429);
        return;
      }
    }

    res.error('Failed to reset password. Please try again.', 500);
  }
};

const refreshTokenHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshTokenRequestBody;

    if (!refreshToken || refreshToken === '') {
      res.error('Refresh token is required', 400);
      return;
    }

    const clientId = environment.cognitoClientId;

    const response = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      }),
    );

    if (response.AuthenticationResult === undefined) {
      res.error('Failed to refresh tokens', 401);
      return;
    }

    const { IdToken, ExpiresIn } = response.AuthenticationResult;

    if (IdToken === undefined) {
      res.error('Failed to refresh tokens', 401);
      return;
    }

    const data: RefreshTokenResponseData = {
      idToken: IdToken,
      expiresIn: ExpiresIn ?? 3600,
    };

    res.success(data);
  } catch (error: unknown) {
    console.error('Token refresh failed:', error);

    if (error instanceof Error) {
      if (error.name === 'NotAuthorizedException') {
        res.error('Refresh token expired or invalid', 401);
        return;
      }

      if (error.name === 'UserNotFoundException') {
        res.error('User not found', 401);
        return;
      }
    }

    res.error('Failed to refresh tokens', 500);
  }
};

export const AuthController = {
  signup,
  confirmSignup,
  login,
  forgotPassword,
  resetPassword,
  refreshToken: refreshTokenHandler,
} as const;
