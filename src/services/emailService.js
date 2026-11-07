const emailSettings = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

// Send a sanitized form summary to the administrator through the configured EmailJS template.
export async function sendAdminEmail(templateParams, formElement = null) {
  if (!Object.values(emailSettings).every(Boolean)) {
    return { sent: false, reason: 'not-configured' };
  }

  try {
    const emailjs = await import('@emailjs/browser');
    if (formElement) {
      await emailjs.default.sendForm(
        emailSettings.serviceId,
        emailSettings.templateId,
        formElement,
        { publicKey: emailSettings.publicKey },
      );
    } else {
      await emailjs.default.send(
        emailSettings.serviceId,
        emailSettings.templateId,
        templateParams,
        { publicKey: emailSettings.publicKey },
      );
    }
    return { sent: true, reason: '' };
  } catch {
    return { sent: false, reason: 'send-failed' };
  }
}
