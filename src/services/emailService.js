import emailjs from '@emailjs/browser';
import { buildAdoptEmail, buildContactEmail, buildJoinEmail, buildReleaseEmail } from './emailContent.js';

const forms = {
  join: { title: 'New membership registration', ackTitle: 'Membership registration received', nameField: 'fullName', build: buildJoinEmail },
  adopt: { title: 'Pet adoption enquiry', ackTitle: 'Adoption enquiry received', nameField: 'applicantName', build: buildAdoptEmail },
  release: { title: 'Pet release support request', ackTitle: 'Release support request received', nameField: 'ownerName', build: buildReleaseEmail },
  contact: { title: 'Website contact message', ackTitle: 'Contact message received', nameField: 'name', build: buildContactEmail },
};

const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const sendSpacingMs = 1100;
let deliveryQueue = Promise.resolve();
let nextSendAt = 0;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => htmlEntities[character]);
}

function renderRows(rows) {
  const markup = rows.map(([label, value]) => {
    const escapedValue = escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>');
    return `<tr><th scope="row" style="text-align:left;vertical-align:top;padding:6px 12px 6px 0">${escapeHtml(label)}</th><td style="padding:6px 0;overflow-wrap:anywhere">${escapedValue}</td></tr>`;
  }).join('');
  return `<table style="border-collapse:collapse;width:100%"><tbody>${markup}</tbody></table>`;
}

function renderDetails(sections) {
  return sections.filter(({ rows }) => rows.length).map(({ heading, rows }) => (
    `<h3>${escapeHtml(heading)}</h3>${renderRows(rows)}`
  )).join('');
}

// Space requests from this browser to respect the provider's one-send-per-second limit.
async function sendEmail(serviceId, templateId, parameters, publicKey) {
  const wait = nextSendAt - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  try {
    await emailjs.send(serviceId, templateId, parameters, { publicKey });
  } finally {
    nextSendAt = Date.now() + sendSpacingMs;
  }
}

async function deliverFormEmails({ formType, data, reference }) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();
  const adminTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN?.trim();
  const ackTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ACK?.trim();
  if (!serviceId || !publicKey || !adminTemplateId) {
    return { sent: false, acknowledgementSent: false, reason: 'not-configured' };
  }

  if (!Object.hasOwn(forms, formType) || !data || !reference) {
    return { sent: false, acknowledgementSent: false, reason: 'send-failed' };
  }

  const form = forms[formType];
  const name = String(data[form.nameField] ?? '').replace(/[\r\n\t]+/g, ' ').trim();
  const email = String(data.email ?? '').trim();
  const content = form.build(data, reference);
  try {
    await sendEmail(serviceId, adminTemplateId, {
      subject: content.subject,
      from_name: name,
      reply_to: email,
      form_type: form.title,
      reference_no: reference,
      submitted_at: data.submittedAt,
      priority: formType === 'release' && data.urgent === true ? 'URGENT' : 'Normal',
      details_html: renderDetails(content.adminRows),
    }, publicKey);
  } catch {
    return { sent: false, acknowledgementSent: false, reason: 'send-failed' };
  }

  if (!ackTemplateId || ackTemplateId === adminTemplateId) {
    return { sent: true, acknowledgementSent: false, reason: 'ack-not-configured' };
  }

  try {
    await sendEmail(serviceId, ackTemplateId, {
      to_email: email,
      subject: `[Pet Heaven] ${form.ackTitle} ${reference}`,
      name,
      reference_no: reference,
      ack_intro: content.ackIntro,
      summary_html: renderRows([[formType === 'join' ? 'Member ID' : 'Reference', reference]]),
      next_steps_html: `<ol>${content.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`,
    }, publicKey);
    return { sent: true, acknowledgementSent: true, reason: '' };
  } catch {
    return { sent: true, acknowledgementSent: false, reason: 'ack-send-failed' };
  }
}

// Deliver the administrator email first. The acknowledgement depends on its success.
export function sendFormEmails(input) {
  const delivery = deliveryQueue.then(() => deliverFormEmails(input));
  deliveryQueue = delivery.catch(() => undefined);
  return delivery;
}
