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

export async function sendNewCaseNotification(
  toEmail: string,
  caseTitle: string,
  legalArea: string
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Nytt ärende inom ${legalArea} – ${caseTitle}`,
      html: `
        <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
          <h2 style="font-family: 'Baskervville', Georgia, serif; color: #1a1a2e; margin-bottom: 8px;">
            Nytt ärende tillgängligt
          </h2>
          <p style="color: #666; margin-bottom: 24px;">
            Ett nytt ärende som matchar era specialiseringar har publicerats på Vertigogo.
          </p>
          <div style="background: #f3f4f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0;"><strong>Ärende:</strong> ${caseTitle}</p>
            <p style="margin: 0;"><strong>Rättsområde:</strong> ${legalArea}</p>
          </div>
          <p style="color: #666; margin-bottom: 24px;">
            Logga in på Vertigogo för att granska ärendet och visa intresse.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            Detta meddelande skickades av Vertigogo. Du får detta mejl eftersom ditt kontor har en notifikations-e-post konfigurerad i ert partnerkonto.
          </p>
        </div>
      `,
    });
    console.log(`New case notification sent to ${toEmail} for case "${caseTitle}"`);
    return true;
  } catch (error) {
    console.error('Failed to send new case notification:', error);
    return false;
  }
}

export async function sendAgencySelectedNotification(
  toEmail: string,
  caseTitle: string,
  legalArea: string
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Klienten har valt er byrå – ${caseTitle}`,
      html: `
        <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
          <h2 style="font-family: 'Baskervville', Georgia, serif; color: #1a1a2e; margin-bottom: 8px;">
            Ni har valts som byrå
          </h2>
          <p style="color: #666; margin-bottom: 24px;">
            Klienten har valt er byrå för att hantera deras ärende på Vertigogo.
          </p>
          <div style="background: #f3f4f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0;"><strong>Ärende:</strong> ${caseTitle}</p>
            <p style="margin: 0;"><strong>Rättsområde:</strong> ${legalArea}</p>
          </div>
          <p style="color: #666; margin-bottom: 24px;">
            Logga in på Vertigogo för att fortsätta konversationen med klienten.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            Detta meddelande skickades av Vertigogo.
          </p>
        </div>
      `,
    });
    console.log(`Agency selected notification sent to ${toEmail} for case "${caseTitle}"`);
    return true;
  } catch (error) {
    console.error('Failed to send agency selected notification:', error);
    return false;
  }
}

export async function sendAgencyNotSelectedNotification(
  toEmail: string,
  caseTitle: string,
  legalArea: string
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Uppdatering om ärende – ${caseTitle}`,
      html: `
        <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
          <h2 style="font-family: 'Baskervville', Georgia, serif; color: #1a1a2e; margin-bottom: 8px;">
            Klienten har valt en annan byrå
          </h2>
          <p style="color: #666; margin-bottom: 24px;">
            Klienten har gått vidare med en annan byrå för sitt ärende på Vertigogo.
          </p>
          <div style="background: #f3f4f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0;"><strong>Ärende:</strong> ${caseTitle}</p>
            <p style="margin: 0;"><strong>Rättsområde:</strong> ${legalArea}</p>
          </div>
          <p style="color: #666; margin-bottom: 24px;">
            Tack för ditt intresse. Nya ärenden som matchar era specialiseringar kommer att dyka upp i er panel.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            Detta meddelande skickades av Vertigogo.
          </p>
        </div>
      `,
    });
    console.log(`Agency not selected notification sent to ${toEmail} for case "${caseTitle}"`);
    return true;
  } catch (error) {
    console.error('Failed to send agency not selected notification:', error);
    return false;
  }
}

export async function sendSelectionRevertedNotification(
  toEmail: string,
  caseTitle: string,
  legalArea: string,
  wasSelected: boolean
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();

    const subject = wasSelected
      ? `Klienten har ändrat sitt val – ${caseTitle}`
      : `Ärendet är öppet igen – ${caseTitle}`;

    const heading = wasSelected
      ? "Klienten har ångrat sitt val"
      : "Ärendet är tillgängligt igen";

    const body = wasSelected
      ? "Klienten har ändrat sitt val och ärendet är nu öppet igen. Ni kan fortsätta konversationen med klienten."
      : "Klienten har ångrat sitt val av byrå och ärendet är tillgängligt igen. Ni kan fortsätta visa intresse.";

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html: `
        <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
          <h2 style="font-family: 'Baskervville', Georgia, serif; color: #1a1a2e; margin-bottom: 8px;">
            ${heading}
          </h2>
          <p style="color: #666; margin-bottom: 24px;">
            ${body}
          </p>
          <div style="background: #f3f4f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0;"><strong>Ärende:</strong> ${caseTitle}</p>
            <p style="margin: 0;"><strong>Rättsområde:</strong> ${legalArea}</p>
          </div>
          <p style="color: #666; margin-bottom: 24px;">
            Logga in på Vertigogo för mer information.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            Detta meddelande skickades av Vertigogo.
          </p>
        </div>
      `,
    });
    console.log(`Selection reverted notification sent to ${toEmail} for case "${caseTitle}"`);
    return true;
  } catch (error) {
    console.error('Failed to send selection reverted notification:', error);
    return false;
  }
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
