// Resend integration (connector:ccfg_resend) for sending email notifications
import { Resend } from 'resend';

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings?.api_key) {
    throw new Error('Resend not connected');
  }

  if (!connectionSettings.settings.from_email) {
    throw new Error('Resend from_email not configured');
  }

  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email
  };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendInquiryNotification(
  toEmail: string,
  caseTitle: string,
  agencyName: string
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Ny intresseanmälan för ditt ärende – ${caseTitle}`,
      html: `
        <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
          <h2 style="font-family: 'Baskervville', Georgia, serif; color: #1a1a2e; margin-bottom: 8px;">
            Ny intresseanmälan
          </h2>
          <p style="color: #666; margin-bottom: 24px;">
            En advokatbyrå har visat intresse för ditt ärende på Vertigogo.
          </p>
          <div style="background: #f3f4f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0;"><strong>Ärende:</strong> ${caseTitle}</p>
            <p style="margin: 0;"><strong>Byrå:</strong> ${agencyName}</p>
          </div>
          <p style="color: #666; margin-bottom: 24px;">
            Logga in på Vertigogo för att se meddelandet och svara byrån.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            Detta meddelande skickades av Vertigogo. Du får detta mejl eftersom du angav din e-postadress när du skapade ditt ärende.
          </p>
        </div>
      `,
    });
    console.log(`Notification email sent to ${toEmail} for case "${caseTitle}"`);
    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}
