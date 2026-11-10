# Pet Heaven EmailJS templates

Pet Heaven uses two templates for Join, Adopt, Release and Contact. A successful submission sends the admin notification first and then the acknowledgement, using two requests from EmailJS's 200-request monthly free allowance. That covers up to 100 complete pairs before dashboard tests and retries. [EmailJS pricing](https://www.emailjs.com/pricing/)

1. Connect your sending account under **Email Services** in the EmailJS dashboard. Send the service's test email to an inbox you control. [Connect an email service](https://www.emailjs.com/docs/user-guide/connecting-email-services/)
2. Create or repurpose two templates named `admin_notification` and `user_acknowledgement`. Use the settings below and paste each body into the HTML/source view of the content editor. Save both templates. [Create an email template](https://www.emailjs.com/docs/tutorial/creating-email-template/)
3. Leave **Attachments**, **Auto-Reply** and **Linked Template** empty on both templates. The website sends both messages directly. The Release email includes the photo filename and size as text, and the form previews the photo in the browser. [EmailJS auto-reply settings](https://www.emailjs.com/docs/user-guide/auto-reply/)
4. Keep your service ID and public key in the project's `.env.local`. Replace the four form-specific template settings with the two new settings below. Use two distinct template IDs displayed in EmailJS, which may differ from the names. Keep any other Firebase and Cat API settings in the file.

```dotenv
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_TEMPLATE_ADMIN=your_admin_template_id
VITE_EMAILJS_TEMPLATE_ACK=your_acknowledgement_template_id
```

Remove the old `VITE_EMAILJS_TEMPLATE_JOIN`, `VITE_EMAILJS_TEMPLATE_ADOPT`, `VITE_EMAILJS_TEMPLATE_RELEASE` and `VITE_EMAILJS_TEMPLATE_CONTACT` entries. Restart Vite after saving. Build with the new values before redeploying the site.

| Setting | `admin_notification` | `user_acknowledgement` |
| --- | --- | --- |
| To Email | Your administrator test inbox | `{{to_email}}` |
| From Email | Connected service's default address | Connected service's default address |
| From Name | Pet Heaven | Pet Heaven |
| Reply To | `{{reply_to}}` | Your monitored administrator inbox |
| Subject | `{{subject}}` | `{{subject}}` |

## Admin notification body

The app supplies `subject`, `from_name`, `reply_to`, `form_type`, `reference_no`, `submitted_at`, `priority` and `details_html`. The timestamp uses UTC. Release uses `URGENT` when the visitor selects the urgency checkbox. Other submissions use `Normal`. Keep double braces for text. Triple braces render the HTML assembled by the app from escaped form values. [EmailJS template variables](https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/)

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F7F6;font-family:Arial,sans-serif;color:#183330;">
  <tr><td align="center" style="padding:16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;">
      <tr><td style="padding:20px;background:#2A9D8F;color:#08211F;">
        <h1 style="margin:0;font-size:26px;line-height:1.3;">Pet Heaven</h1>
        <p style="margin:4px 0 0;font-size:16px;">Administrator notification</p>
      </td></tr>
      <tr><td style="padding:20px;font-size:16px;line-height:1.55;overflow-wrap:anywhere;">
        <h2 style="margin:0 0 12px;font-size:21px;">{{form_type}}</h2>
        <p style="margin:0 0 16px;">
          <strong>Reference</strong> {{reference_no}}<br>
          <strong>Submitted at (UTC)</strong> {{submitted_at}}<br>
          <strong>Priority</strong> {{priority}}<br>
          <strong>Applicant</strong> {{from_name}}<br>
          <strong>Reply email</strong> {{reply_to}}
        </p>
        <h3 style="margin:0 0 8px;font-size:18px;">Submission details</h3>
        {{{details_html}}}
      </td></tr>
    </table>
  </td></tr>
</table>
```

## User acknowledgement body

The app supplies `to_email`, `subject`, `name`, `reference_no`, `ack_intro`, `summary_html` and `next_steps_html`. The message uses a form-specific introduction, a short reference summary and numbered next steps. Join includes the member ID and next steps for the selected support roles. Adopt explains that staff will confirm the requested interview slot after contacting the applicant. Release explains that acceptance is pending. Contact sets a reply expectation of three working days.

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F7F6;font-family:Arial,sans-serif;color:#183330;">
  <tr><td align="center" style="padding:16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;">
      <tr><td style="padding:20px;background:#2A9D8F;color:#08211F;">
        <h1 style="margin:0;font-size:26px;line-height:1.3;">Pet Heaven</h1>
        <p style="margin:4px 0 0;font-size:16px;">Your acknowledgement</p>
      </td></tr>
      <tr><td style="padding:20px;font-size:16px;line-height:1.55;overflow-wrap:anywhere;">
        <p style="margin:0 0 12px;">Hello {{name}},</p>
        <p style="margin:0 0 12px;">{{ack_intro}}</p>
        <p style="margin:0 0 16px;"><strong>Reference</strong> {{reference_no}}</p>
        {{{summary_html}}}
        <h2 style="margin:16px 0 8px;font-size:20px;">What happens next</h2>
        {{{next_steps_html}}}
        <p style="margin:16px 0 0;">Pet Heaven team</p>
      </td></tr>
    </table>
  </td></tr>
</table>
```

## Test It examples

Open **Test It** in the indicated template and enter the matching parameter values below. If the dialog shows one field per variable, copy each value into its field. Replace `demo@example.com` with an address you control before sending, especially in `to_email`. Preview the message and send a test from the dialog. Use the same reference for the admin and acknowledgement examples. [Test an EmailJS template](https://www.emailjs.com/docs/user-guide/creating-email-templates/)

### Join

**Admin parameters**

```json
{
  "subject": "[Pet Heaven] New member registration PH-2026-A1B2: Volunteer, Foster, Donor",
  "from_name": "Demo Supporter",
  "reply_to": "demo@example.com",
  "form_type": "New membership registration",
  "reference_no": "PH-2026-A1B2",
  "submitted_at": "2026-11-10T02:30:00.000Z",
  "priority": "Normal",
  "details_html": "<h3>Member details</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Member ID</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">PH-2026-A1B2</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Full name</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Demo Supporter</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Email</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">demo@example.com</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Phone</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">8123 4567</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Home address</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">12 Example Road, Singapore</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Age confirmation (18 or older)</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Yes</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Data consent</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Yes</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Newsletter opt-in</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">No</td></tr></tbody></table><h3>Support interests</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Selected roles</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Volunteer, Foster, Donor</td></tr></tbody></table><h3>Volunteer details</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Availability days</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Saturday, Sunday</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Hours per week</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">4</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Skills you can share</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Pet photography</td></tr></tbody></table><h3>Foster details</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Housing type</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Condominium</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Other pets at home</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">One older cat</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Species preference</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Cats</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Available fostering duration</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">1 to 3 months</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Describe the space you can offer</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">A quiet spare room with a window screen.</td></tr></tbody></table><h3>Donor details</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Pledge type</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Monthly</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Amount range</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">S$25 to S$49</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Pet to sponsor (optional)</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Milo (Dog)</td></tr></tbody></table>"
}
```

**Acknowledgement parameters**

```json
{
  "to_email": "demo@example.com",
  "subject": "[Pet Heaven] Membership registration received PH-2026-A1B2",
  "name": "Demo Supporter",
  "reference_no": "PH-2026-A1B2",
  "ack_intro": "Welcome to Pet Heaven! We have received your membership registration.",
  "summary_html": "<table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Member ID</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">PH-2026-A1B2</td></tr></tbody></table>",
  "next_steps_html": "<ol><li>Log in to your member area to view your membership card and start an adoption enquiry.</li><li>The team will contact you about volunteer opportunities and an orientation.</li><li>The team will contact you to discuss fostering requirements and availability.</li><li>Look out for information from the team about ways to support Pet Heaven.</li></ol>"
}
```

### Adopt

**Admin parameters**

```json
{
  "subject": "[Pet Heaven] New adoption request AD-2026-K8R4: Miso",
  "from_name": "Demo Adopter",
  "reply_to": "demo@example.com",
  "form_type": "Pet adoption enquiry",
  "reference_no": "AD-2026-K8R4",
  "submitted_at": "2026-11-10T02:30:00.000Z",
  "priority": "Normal",
  "details_html": "<h3>Applicant details</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Member ID</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">PH-2026-A1B2</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Applicant name</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Demo Adopter</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Email</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">demo@example.com</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Phone</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">8123 4567</td></tr></tbody></table><h3>Pet and household</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Pet name</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Miso</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Pet ID</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">miso</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Housing type</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">HDB flat</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Own or rent</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Own</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Household members</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Two adults</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Other pets</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">None</td></tr></tbody></table><h3>Care plan</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Pet care experience</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">I have cared for a family cat.</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Work or study schedule</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Mostly at home</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Adoption reason</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">We can give Miso a quiet home with a consistent routine.</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Long-term care commitment</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Yes</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Care costs commitment</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Yes</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Interview and home visit consent</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Yes</td></tr></tbody></table><h3>Interview preference</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Preferred date</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">2026-11-14</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Preferred time</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">10:00</td></tr></tbody></table>"
}
```

**Acknowledgement parameters**

```json
{
  "to_email": "demo@example.com",
  "subject": "[Pet Heaven] Adoption enquiry received AD-2026-K8R4",
  "name": "Demo Adopter",
  "reference_no": "AD-2026-K8R4",
  "ack_intro": "We have received your adoption enquiry. Your requested interview slot will be confirmed only after the team contacts you.",
  "summary_html": "<table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Reference</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">AD-2026-K8R4</td></tr></tbody></table>",
  "next_steps_html": "<ol><li>Keep this reference for follow-up.</li><li>Wait for the team to contact you to confirm the interview arrangements.</li></ol>"
}
```

### Release

**Admin parameters**

```json
{
  "subject": "[Pet Heaven] URGENT New release request RL-2026-PL19: Mochi",
  "from_name": "Demo Owner",
  "reply_to": "demo@example.com",
  "form_type": "Pet release support request",
  "reference_no": "RL-2026-PL19",
  "submitted_at": "2026-11-10T02:30:00.000Z",
  "priority": "URGENT",
  "details_html": "<h3>Owner details</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Owner name</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Demo Owner</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Email</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">demo@example.com</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Phone</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">8123 4567</td></tr></tbody></table><h3>Pet details</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Pet name</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Mochi</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Species</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Cat</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Breed or best guess</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Domestic shorthair</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Age in years</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">3</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Gender</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Female</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Size</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Small</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Colour</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Grey</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Vaccinated</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Yes</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Sterilised</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Yes</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Health notes</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Routine vet check completed.</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Behaviour and routine</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Quiet indoors.</td></tr></tbody></table><h3>Support request</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Reason for reaching out</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Family or life change</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Situation details</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">I am moving abroad next month and need support.</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Preferred handover date</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">2026-11-16</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Urgent assistance requested</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Yes</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Consent to contact</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Yes</td></tr></tbody></table><h3>Photo information</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Photo filename</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">mochi.jpg</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Photo size (bytes)</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">62441</td></tr></tbody></table>"
}
```

**Acknowledgement parameters**

```json
{
  "to_email": "demo@example.com",
  "subject": "[Pet Heaven] Release support request received RL-2026-PL19",
  "name": "Demo Owner",
  "reference_no": "RL-2026-PL19",
  "ack_intro": "We have received your pet release support request. Our team will review it before deciding whether we can accept your pet.",
  "summary_html": "<table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Reference</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">RL-2026-PL19</td></tr></tbody></table>",
  "next_steps_html": "<ol><li>Keep this reference for follow-up.</li><li>Wait for the team to contact you before making handover arrangements.</li></ol>"
}
```

### Contact

**Admin parameters**

```json
{
  "subject": "[Pet Heaven] New contact message CT-2026-Q2W3: Visiting hours",
  "from_name": "Demo Visitor",
  "reply_to": "demo@example.com",
  "form_type": "Website contact message",
  "reference_no": "CT-2026-Q2W3",
  "submitted_at": "2026-11-10T02:30:00.000Z",
  "priority": "Normal",
  "details_html": "<h3>Contact details</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Name</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Demo Visitor</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Email</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">demo@example.com</td></tr></tbody></table><h3>Message</h3><table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Subject</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Visiting hours</td></tr><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Message</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">Could you share your Saturday visiting hours?</td></tr></tbody></table>"
}
```

**Acknowledgement parameters**

```json
{
  "to_email": "demo@example.com",
  "subject": "[Pet Heaven] Contact message received CT-2026-Q2W3",
  "name": "Demo Visitor",
  "reference_no": "CT-2026-Q2W3",
  "ack_intro": "We have received your message. Our team will reply within 3 working days.",
  "summary_html": "<table style=\"border-collapse:collapse;width:100%\"><tbody><tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:6px 12px 6px 0\">Reference</th><td style=\"padding:6px 0;overflow-wrap:anywhere\">CT-2026-Q2W3</td></tr></tbody></table>",
  "next_steps_html": "<ol><li>Keep this reference for follow-up.</li><li>Watch your inbox for a reply from the Pet Heaven team.</li></ol>"
}
```

## Check the forms locally

- Set your primary inbox as the administrator address. Configure Firebase Authentication and Firestore for Join and Adopt as described in the [README](../README.md). Start Vite with `npm.cmd run dev` and submit Join, Adopt, Release and Contact using sample details and a second inbox you control as the applicant. Match the two received emails for each form to the on-screen reference.
- For Join, select Donor, Volunteer and Foster and answer the role questions. Verify the admin message contains the answers and the acknowledgement gives steps for the selected roles. The Join result and any email retry appear in the member area.
- For Adopt, check that the acknowledgement describes the requested interview slot and that staff will confirm it. For Contact, check the three-working-day reply expectation.
- For Release, select the urgent checkbox and a small sample image. Check the local preview, `URGENT` in the admin subject and priority, and the filename and size in the admin email. The acknowledgement should say acceptance is pending.
- Try another valid submission within 30 seconds of an attempt. Wait the number of seconds shown before trying again. The cooldown applies across the four forms and includes admin retries.
- To check the spam trap, set the hidden `website` input to sample text in browser developer tools and try submitting a valid form. Check that the attempt is rejected before saving or sending.
- With Contact already open, temporarily take the browser offline and submit valid sample data. Restore the connection, let the cooldown finish and select **Retry email** on the same page. Check the original reference and one saved record.
- For a partial delivery check, temporarily give the acknowledgement template an invalid ID in the local settings and restart Vite before sending a sample form. Check that admin success stays visible with an acknowledgement warning. Restore the correct ID and restart Vite before the next test.

The automated tests use mocked email delivery. Repeat the inbox checks after deploying a build with both template IDs.
