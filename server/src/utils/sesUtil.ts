import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { environment } from '../config/environment.js';

const sesClient = new SESClient({ region: environment.awsRegion });

const SES_FROM_USERNAME = 'noreply';

function getFromEmail(): string {
  return `${SES_FROM_USERNAME}@${environment.domainName}`;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

/**
 * Sends an email via AWS SES.
 *
 * The sender address is derived from the DOMAIN_NAME env var (noreply@{domain}).
 * The domain must be verified in the SES console.
 *
 * @example
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   htmlBody: '<h1>Hi</h1>',
 *   textBody: 'Hi',
 * });
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  const fromEmail = getFromEmail();

  await sesClient.send(
    new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: [params.to],
      },
      Message: {
        Subject: { Data: params.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: params.htmlBody, Charset: 'UTF-8' },
          Text: { Data: params.textBody, Charset: 'UTF-8' },
        },
      },
    }),
  );
}

/** Escapes HTML special characters for safe embedding in email templates. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
