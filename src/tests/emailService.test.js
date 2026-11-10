import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import emailjs from '@emailjs/browser';
import {
  buildAdoptEmail,
  buildContactEmail,
  buildJoinEmail,
  buildReleaseEmail,
} from '../services/emailContent.js';

vi.mock('@emailjs/browser', () => ({
  default: { send: vi.fn() },
}));

const submittedAt = '2026-11-09T02:00:00.000Z';
const email = 'jamie@example.com';
const contact = {
  name: 'Jamie Tan',
  email,
  phone: '',
  subject: 'Adoption question',
  message: 'Please tell me how to book a visit. <img src=x onerror="alert(1)"> & thanks.',
  submittedAt,
};
const join = {
  fullName: 'Jamie Tan',
  email,
  phone: '81234567',
  address: '10 River Valley Road',
  ageConfirmed: true,
  dataConsent: true,
  roles: ['donor', 'foster'],
  roleDetails: {
    donor: { donorPledgeType: 'Monthly', donorAmountRange: 'S$25 to S$49' },
    foster: { fosterSpace: 'A spare room with a secure door' },
    volunteer: { volunteerSkills: 'Unselected role detail' },
  },
  newsletter: false,
  submittedAt,
};
const adopt = {
  applicantName: 'Jamie Tan',
  email,
  phone: '',
  memberId: 'PH-2026-A123',
  petName: 'Milo',
  housingType: 'Condominium',
  tenure: 'rent',
  landlordPermission: true,
  householdMembers: 'Two adults',
  otherPets: '',
  experience: 'I have cared for cats for several years.',
  workSchedule: 'mostly-home',
  reason: 'I can offer daily care and a quiet home for Milo.',
  commitmentLongTerm: true,
  commitmentFinancial: true,
  interviewConsent: true,
  preferredDate: '2026-11-12',
  preferredTime: '10:00',
  submittedAt,
};
const release = {
  ownerName: 'Jamie Tan',
  email,
  phone: '81234567',
  petName: 'Clover',
  petSpecies: 'Cat',
  petBreed: 'Domestic Shorthair',
  petAgeYears: 3,
  petGender: 'Female',
  petSize: 'Small',
  petColour: 'Tabby',
  vaccinated: 'Yes',
  sterilised: 'Yes',
  reason: 'housing',
  reasonDetails: 'Our housing changed and we would like advice about safe options.',
  handoverDate: '2026-11-12',
  photoFileName: 'clover.jpg',
  photoFileSize: 512,
  consent: true,
  urgent: true,
  submittedAt,
};

function rowText(content) {
  return content.adminRows.flatMap(({ rows }) => rows.map(([label, value]) => `${label}: ${value}`)).join('\n');
}

describe('Form email content', () => {
  it('builds a Contact subject and includes the original message in plain-text rows', () => {
    const content = buildContactEmail(contact, 'CT-2026-A123');
    expect(content.subject).toBe('[Pet Heaven] Message CT-2026-A123: Adoption question');
    expect(rowText(content)).toContain(contact.message);
    expect(content.ackIntro).toEqual(expect.any(String));
    expect(content.nextSteps.length).toBeGreaterThan(0);
  });

  it('includes the Join member ID and selected role details while omitting an unselected role', () => {
    const content = buildJoinEmail(join, 'PH-ABCD23');
    expect(content.subject).toBe('[Pet Heaven] New member PH-ABCD23 (Foster, Donor)');
    const rows = rowText(content);
    expect(rows).toContain('Member ID: PH-ABCD23');
    expect(rows).toContain('Pledge type: Monthly');
    expect(rows).toContain('Describe the space you can offer: A spare room with a secure door');
    expect(rows).not.toContain('Unselected role detail');
    expect(content.nextSteps.length).toBeGreaterThan(0);
  });

  it('includes Adopter and exactly three fixed next steps for adoption-only registration', () => {
    const content = buildJoinEmail({ ...join, roles: ['adopter'] }, 'PH-ABCD23');
    expect(content.subject).toBe('[Pet Heaven] New member PH-ABCD23 (Adopter)');
    expect(rowText(content)).toContain('Selected roles: Adopter');
    expect(content.adminRows.map(({ heading }) => heading)).toEqual(['Member details', 'Support interests']);
    expect(content.nextSteps).toEqual([
      'Browse available pets.',
      'Open a pet’s profile and choose Adopt.',
      'Staff will contact you to arrange an interview.',
    ]);
  });

  it('combines adoption and other role steps without copying submitted text into the acknowledgement', () => {
    const content = buildJoinEmail({ ...join, roles: ['Adopter', 'Donor', 'foster'] }, 'PH-ABCD23');
    expect(rowText(content)).toContain('Selected roles: Adopter, Foster, Donor');
    expect(content.nextSteps).toHaveLength(5);
    expect(content.nextSteps[3]).toMatch(/fostering/);
    expect(content.nextSteps[4]).toMatch(/ways to support/);
    expect([content.ackIntro, ...content.nextSteps].join(' ')).not.toMatch(/spare room|River Valley|Unselected role detail/);
  });

  it('includes the pet and requested interview slot in the Adopt content', () => {
    const content = buildAdoptEmail(adopt, 'AD-2026-A123');
    expect(content.subject).toBe('[Pet Heaven] New adoption request AD-2026-A123: Milo');
    const rows = rowText(content);
    expect(rows).toContain(adopt.memberId);
    expect(rows).toContain(adopt.householdMembers);
    expect(rows).toContain(adopt.preferredDate);
    expect(rows).toContain(adopt.preferredTime);
  });

  it('flags an urgent Release and describes the photo by filename and size', () => {
    const content = buildReleaseEmail(release, 'RL-2026-A123');
    expect(content.subject).toBe('[Pet Heaven] URGENT release request RL-2026-A123: Clover');
    const rows = rowText(content);
    expect(rows).toContain('clover.jpg');
    expect(rows).toContain('512');
    expect(rows).toContain(release.reasonDetails);
    expect(buildReleaseEmail({ ...release, urgent: false }, 'RL-2026-A123').subject).not.toContain('URGENT');
  });
});

describe('Administrator and acknowledgement email delivery', () => {
  let sendFormEmails;

  beforeEach(async () => {
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'service_test');
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'public_key_test');
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ADMIN', 'template_admin');
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ACK', 'template_ack');
    vi.mocked(emailjs.send).mockReset().mockResolvedValue({ status: 200, text: 'OK' });
    vi.resetModules();
    ({ sendFormEmails } = await import('../services/emailService.js'));
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it.each([
    ['contact', contact, 'CT-2026-A123', 'Normal'],
    ['join', join, 'PH-ABCD23', 'Normal'],
    ['adopt', adopt, 'AD-2026-A123', 'Normal'],
    ['release', release, 'RL-2026-A123', 'URGENT'],
  ])('sends the %s administrator email before the acknowledgement', async (formType, data, reference, priority) => {
    const sending = sendFormEmails({ formType, data, reference });
    await vi.advanceTimersByTimeAsync(999);
    expect(emailjs.send).toHaveBeenCalledTimes(1);
    await vi.runAllTimersAsync();
    await expect(sending).resolves.toEqual({ sent: true, acknowledgementSent: true, reason: '' });
    expect(emailjs.send).toHaveBeenCalledTimes(2);
    expect(emailjs.send).toHaveBeenNthCalledWith(1, 'service_test', 'template_admin', {
      subject: expect.stringContaining(reference),
      from_name: 'Jamie Tan',
      reply_to: email,
      form_type: expect.any(String),
      reference_no: reference,
      submitted_at: '9 Nov 2026, 10:00:00 SGT',
      priority,
      details_html: expect.any(String),
    }, { publicKey: 'public_key_test' });
    expect(emailjs.send).toHaveBeenNthCalledWith(2, 'service_test', 'template_ack', {
      to_email: email,
      subject: expect.stringContaining(reference),
      name: 'Jamie Tan',
      reference_no: reference,
      ack_intro: expect.any(String),
      summary_html: expect.any(String),
      next_steps_html: expect.any(String),
    }, { publicKey: 'public_key_test' });

    const [, , admin] = emailjs.send.mock.calls[0];
    const [, , acknowledgement] = emailjs.send.mock.calls[1];
    if (formType === 'contact') {
      expect(admin.details_html).toContain('&lt;img');
      expect(admin.details_html).toContain('&amp; thanks.');
      expect(admin.details_html).not.toContain('<img ');
      expect(acknowledgement.summary_html).not.toContain('onerror');
    }
    const acknowledgementText = JSON.stringify(acknowledgement);
    for (const answer of [contact.subject, contact.message, join.address, join.roleDetails.foster.fosterSpace, adopt.reason, release.reasonDetails]) {
      expect(acknowledgementText).not.toContain(answer);
    }
    if (formType === 'join') {
      expect(acknowledgement.summary_html).toContain(reference);
      expect(acknowledgement.summary_html).not.toContain(join.address);
    }
  });

  it('reports a missing administrator template without sending either email', async () => {
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ADMIN', '');
    await expect(sendFormEmails({ formType: 'release', data: release, reference: 'RL-2026-A123' })).resolves.toEqual({
      sent: false,
      acknowledgementSent: false,
      reason: 'not-configured',
    });
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it('does not acknowledge an administrator send failure', async () => {
    vi.mocked(emailjs.send).mockRejectedValueOnce(new Error('Email service unavailable'));
    const sending = sendFormEmails({ formType: 'contact', data: contact, reference: 'CT-2026-A123' });
    await vi.runAllTimersAsync();
    await expect(sending).resolves.toEqual({
      sent: false,
      acknowledgementSent: false,
      reason: 'send-failed',
    });
    expect(emailjs.send).toHaveBeenCalledTimes(1);
  });

  it('preserves administrator success if the acknowledgement fails', async () => {
    vi.mocked(emailjs.send)
      .mockResolvedValueOnce({ status: 200, text: 'OK' })
      .mockRejectedValueOnce(new Error('Could not send acknowledgement'));
    const sending = sendFormEmails({ formType: 'contact', data: contact, reference: 'CT-2026-A123' });
    await vi.runAllTimersAsync();
    await expect(sending).resolves.toEqual({
      sent: true,
      acknowledgementSent: false,
      reason: 'ack-send-failed',
    });
    expect(emailjs.send).toHaveBeenCalledTimes(2);
  });

  it.each(['', 'template_admin'])('sends one email with an invalid acknowledgement template ID %j', async (templateId) => {
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ACK', templateId);
    const sending = sendFormEmails({ formType: 'contact', data: contact, reference: 'CT-2026-A123' });
    await vi.runAllTimersAsync();
    await expect(sending).resolves.toEqual({
      sent: true,
      acknowledgementSent: false,
      reason: 'ack-not-configured',
    });
    expect(emailjs.send).toHaveBeenCalledTimes(1);
  });
});
