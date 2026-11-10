# Pet Heaven handoff

Local baseline after Phase 4B. Implementation status is separate from live deployment and device verification. Preserve completed features and verify unknowns before changing them.

## 1. Assignment constraints

- ISIT207 Assignment 3, individual work. Due **15 Nov 2026 at 23:50 SGT**. Late penalty **25% per day**.
- Part A is the React web app. Part B is a PDF review report and narrated screen recording with the required links. The repository includes a six-minute draft script.
- Unacknowledged material counts as plagiarism. Verify photo credits, licences, and sources. Identify Pet Heaven as a fictional Singapore charity.
- Focus on component reuse, SPA behaviour, validation, usability, and design. Hosting, searching and browsing, database integration, and integration tests are extra-credit areas.

## 2. Run, build, test and deploy

**Exact folder**

```text
C:\Users\sawni\Desktop\SIM\OneDrive - University of Wollongong\OneDrive - University of Wollongong\SIM\Year2\Semester3\ISIT207\Assignments\Assignment3
```

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run build
npm.cmd test -- --maxWorkers=2
npm.cmd run check:images
firebase.cmd deploy --only firestore:rules,hosting --project petheaven-b7766
```

- Project `petheaven-b7766`. Hosting [Pet Heaven](https://petheaven-b7766.web.app/). **Deploy rules and Hosting TOGETHER** after building. The current app and rules must match, especially for new roles, reservations, and staff pet writes.
- `firebase.json` publishes `dist`, rewrites SPA URLs to `index.html`, and deploys `firestore.rules` for `(default)`. `vite.config.js` configures React and Vitest. `.env.example` lists variable names. Local values belong in ignored `.env.local`. `package.json` and `package-lock.json` specify dependencies.
- An initial Hosting deployment succeeded. Which later build and rules are live is **UNKNOWN - verify**.

## 3. Status

| Phase or prompt | Status | What exists |
| --- | --- | --- |
| Original Phase 1 setup | Done | React/Vite, routes, shared layout, navbar, footer, CSS variables |
| Original Phase 2 components | Done | Shared UI/forms, hooks, validators |
| Original Phase 3 catalogue | Done | Bundled pets, search/filter/sort, details, favourites |
| Original Phase 4 Home and About | Done | Home and About content and shared sections |
| Original Phase 5 forms | Done | Join, Adopt, Release, Contact with Firebase and EmailJS |
| Original Phase 6 polish | Done | Friendly 404, responsive layout, dark mode and accessibility work |
| Original Phase 7 tests and hosting | Done | Vitest, Hosting config, initial Firebase deploy |
| Original Phase 8 coursework docs | Done | README, review report outline, recording script |
| Design step 1 and chevrons | Done | Responsive navigation, accessible dropdowns and footer |
| Design step 2 Home | Done | Hero, featured pets, tile layout, stories, news and calls to action |
| Design steps 3 and 4 | Done | Banners, pet cards, HDB filter, inner-page forms, legal and credits pages |
| Image scan and apply | Done | Local assets, metadata, lazy images, fallback and path check. Credit verification remains |
| Random photos and auto-advance | Done | Optional dog/cat photo strip with cycling, fallback, and mocked tests |
| Form email and database upgrades | Done | Firestore records, references, EmailJS admin and acknowledgement, retry and fallback |
| Real accounts and Get Involved | Done | Auth, protected member pages, role-specific Join, profile updates, My Requests |
| Admin Phase 0 audit | Done | Real accounts already existed. User revised the plan to preserve them |
| Admin Phase 1 submission pipeline | Done | Two email templates, references, retries, staff-safe metadata, agreed rules |
| Admin Phase 2 auth | Done | Staff allowlist, protected routes, noindex, footer entry |
| Admin Phase 3 read-only dashboard | Done | Four submission tabs, overview, details, bounded reads and role filters |
| Admin Phase 4 quick actions and call log | Done | Confirmed actions, call outcomes, private history and notes, CSV and print. New Join saves email; dashboard reads it. Legacy label fixed |
| Phase 4 availability amendment | Done | Transactional Reserve/Adopt transitions, conflict checks, manual corrections and public guards |
| Adopter role | Done | Standalone role, no extra questions, links, email, member edits, dashboard counts and rules |
| Phase 5 final checks and normal staff login | Partly done | Local final checks and redirect to Staff Overview done. Final live and device checks pending |
| Phase 4B staff pet management | Done | Local add/edit/archive/restore, compressed photos, credit and availability. Live camera/deployment checks pending |
| Test data resets | Done | Prior reset kept staff and removed test members/logins, release request and message |
| Final hand-in materials | Partly done | Report outline and recording script exist. Final PDF, recording and submission are UNKNOWN - verify |

Last recorded result after Phase 4B on 10 Nov 2026 was **192 tests passed across 16 files**, production build passed, and 19 synthetic Firestore rule simulations matched expectations. No checks were rerun for this handoff. Read-only Git status showed a clean working tree on `main`, two commits ahead of the local `origin/main` tracking ref, before this revision. This pass updates four tracked documentation files.

## 4. Architecture snapshot

| Area | Routes and implementation |
| --- | --- |
| Public | `/`, `/about`, `/get-involved`, `/pets`, `/pets/:id`, `/join`, `/login`, `/forgot-password`, `/release`, `/contact`, `/privacy`, `/terms`, `/credits`, wildcard 404. The pet detail modal is route-backed. |
| Member | `/member` and `/adopt` require Auth. `/member#requests` shows My Requests. Join can resume a partial registration. `ProtectedRoute`, `AuthContext`, `authService`, `memberService`, `useForm`. |
| Staff | `/admin/login`, `/admin`, `/admin/members`, `/admin/adoption`, `/admin/release`, `/admin/messages`, `/admin/pets`. `AdminRoute`, `AdminAuthContext`, `AdminWorkflowContext`, `AdminLayout`, `DataTable`, `DetailPanel`, `AdminPets`, `adminDataService`, `adminWorkflowService`. |
| Shared catalogue | `usePets` and `petService` load legacy Firestore pets or bundled `pets.json`, merge public staff pets by ID, and overlay availability. `PetCard`, `PetDetailModal`, `AddPetModal`, `staffPetService`, `imageProcessing`, `images.js`. |
| Forms and config | `FormField`, `FormPageShell`, `RoleCard`, `SubmissionFeedback`, `useAdminSubmission`, `validators`, `dataService`, `referenceService`, `emailContent`, `emailService`, `firebaseClient`. Data config includes `roles.js`, `staffPetFields.js`, `adminDashboard.js`, and `adminWorkflow.js`. |

## 5. Firestore data model

Every collection below is supported locally. The live-history column records prior observations, and current contents are **UNKNOWN - verify**. The `pets` field list describes the bundled fallback because the legacy remote schema is not enforced in code.

`request metadata` below means `referenceId, referenceNo, type, status, createdAt, updatedAt, updatedBy`.

| Collection / ID | Fields | Live history |
| --- | --- | --- |
| `members/{uid}` | `uid, memberId, firstName, fullName, phone, address, roles, status, createdAt, ageConfirmed, dataConsent, newsletter`. New records add `email, roleDetails, updatedAt`. Staff may add `staffStatus, updatedBy`. | Previously present and cleared during the member reset |
| `adoption_requests/{autoId}` | Request metadata plus `userId, memberId, applicantName, email, phone, petId, petName, housingType, tenure, landlordPermission, householdMembers, otherPets, experience, workSchedule, reason, commitmentLongTerm, commitmentFinancial, interviewConsent, preferredDate, preferredTime`. | **UNKNOWN - verify** |
| `release_requests/{autoId}` | Request metadata plus `ownerName, email, phone, petName, petSpecies, petBreed, petAgeYears, petGender, petSize, petColour, vaccinated, sterilised, microchip, healthNotes, behaviourNotes, reason, reasonDetails, handoverDate, photoFileName, photoFileType, photoFileSize, consent, urgent`. | Previously present and cleared during the release reset |
| `contact_messages/{autoId}` | Request metadata plus `name, email, phone, subject, message`. | Previously present and cleared during the message reset |
| `pets/{petId}` | Read-only remote source. Bundled shape `id, name, species, breed, ageYears, ageGroup, gender, size, colour, vaccinated, sterilised, goodWithKids, goodWithPets, hdbFriendly, temperament, story, healthNotes, status, image, gallery, dateAdded`. Exact legacy live fields **UNKNOWN - verify**. | **UNKNOWN - verify** |
| `admins/{uid}` | Document existence authorises staff. No field is required by the app or rule. Provisioned outside the client. | Staff allowlist observed and kept during the reset |
| `admin_notes/{collection}_{docId}` | `updatedAt, updatedBy` and `text` and/or `history`. Text max 1,000. History entries `action, fromStatus, toStatus, outcome, note, at, by`. | **UNKNOWN - verify** |
| `pet_availability/{petId}` | `status, updatedAt, updatedBy`, optional `adoptionRef`. Status is Available, Reserved or Adopted. Public `updatedBy` is a staff UID. | **UNKNOWN - verify** |
| `staff_pets/{petId}` | `id, name, species, breed, gender, ageYears, ageMonths, ageGroup, size, colour, vaccinated, sterilised, microchip, goodWithKids, goodWithPets, hdbFriendly, energyLevel, temperament, story, healthNotes, specialNeeds, image, imageAlt, photoCredit, source, archived, createdBy, createdAt, updatedAt`. `photoCredit` holds `type, photographer, source, url`. | **UNKNOWN - verify** |
| `pet_images/{petId}` | `gallery, alts`, parallel arrays of up to two extra photos. | **UNKNOWN - verify** |

- The app uses Firestore auto IDs for the three request/message collections and a separate human reference. Member docs are keyed by Auth UID. New member references are `PH-XXXXXX`. Request references are `AD/RL/CT-YYYY-XXXX`. Email retry reuses the saved record, reference and ISO timestamp.
- `createdAt` and workflow dates remain ISO strings. `members.status` stays Active. Staff uses `staffStatus`, with missing values displayed as New. Adoption starts Submitted and displays New.
- Roles are arrays of lowercase IDs `adopter, volunteer, foster, donor`. Rules also accept their exact display labels. `roleDetails` uses lowercase keys for the three questionnaire roles. Adopter has no questionnaire. Older members may lack newer fields.
- Notes and history live in `admin_notes`, separate from owner-readable records.

## 6. Security rules

`isAdmin()` checks the existence of `admins/{request.auth.uid}`. All client deletes are denied.

| Collection | Read | Create | Update |
| --- | --- | --- | --- |
| members | Owner get. Staff get/list | Signed-in owner with validated profile | Owner can edit selected profile fields. Staff can edit staffStatus and update metadata |
| adoption_requests | Owner get and owner-filtered list. Staff get/list | Signed-in owner with matching profile and Auth email. Pet must be available and unarchived | Staff only, workflow status and update metadata |
| release_requests, contact_messages | Staff get/list | Public with validated fields | Staff only, workflow status and update metadata |
| pets | Public | Denied | Denied |
| admins | Own get only | Denied | Denied |
| admin_notes | Staff get/list | Staff, with validated notes/history | Staff, with validated notes and append-only history |
| pet_availability | Public get/list | Staff, with validated status and metadata | Staff, same validation |
| staff_pets | Staff get/list. Public get for unarchived records and list with the archive filter | Staff, validated active profile | Staff, validated profile with creator and creation date preserved |
| pet_images | Public get by ID. List denied | Staff, validated gallery | Staff, validated gallery |

- Phase 4 availability rules compiled. The expected owner/staff/availability cases are in [staff-access.md](staff-access.md).
- Adopter passed 22 synthetic create/update simulations covering accepted IDs and labels, invalid roles, non-lists, duplicates and list bounds.
- Phase 4B passed 19 synthetic outcomes covering published/archived gets, public/member write denials, staff create/edit/archive/restore, invalid species, image size, archive flag, gallery permissions and alt-count validation.
- Other live Playground results are **UNKNOWN - verify**.

## 7. EmailJS

| Template | Exact parameters |
| --- | --- |
| `admin_notification` | `subject, from_name, reply_to, form_type, reference_no, submitted_at, priority, details_html` |
| `user_acknowledgement` | `to_email, subject, name, reference_no, ack_intro, summary_html, next_steps_html` |

Vars `VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_TEMPLATE_ADMIN, VITE_EMAILJS_TEMPLATE_ACK`. Configure the recipient in EmailJS. See [templates and setup](emailjs-templates.md).

Validate → honeypot/cooldown → save → required administrator email → best-effort acknowledgement. Failed admin email shows retry and retains the saved data. Acknowledgement failure shows a warning after admin success. The acknowledgement excludes free-text answers. Release photo metadata is sent as text. Staff-only pet photos use a separate feature.

## 8. Decisions to preserve

- Keep existing Firebase Auth and member protections. Staff can enter through either login. Public staff checks never sign members out.
- Keep honeypot, 30-second browser cooldown for submissions and retries, in-flight protection, and escaped HTML emails. No passwords in Firestore, browser form records, or email. No payments.
- Keep browser fallback for request submissions when appropriate. An adoption write denied for permissions/auth is surfaced instead of saved as a local success. Join profiles require Firestore. Browser-only submissions are absent from the staff dashboard.
- Fail open if the availability read fails. Recheck immediately before submit. Firestore rules still reject unavailable or archived pets. Approve/complete/release reservation and private history writes are transactional.
- Dashboard reads up to 500 ordered records per collection plus one bounded undated sample. Use no composite indexes. Staff-pet public query only filters `archived == false`. Existing pet source remains read-only.
- Photos are client-cropped 4:3, at most 1,000 px wide and 150 KB per encoded image. One main and up to two extra photos. Extra gallery reads occur on detail/edit. A gallery remains public by ID after archive.

## 9. Pending work in priority order

Items 1–4 are implemented locally. The remaining work is live verification and any defect it exposes. Keep the test accounts disposable and preserve the staff allowlist and real records.

### 1. Adopter role · Live verification

**Goal** · Confirm that someone can join solely to adopt.

- WHEN a visitor chooses Adopter alone or follows the preselected Join link, THE SYSTEM SHALL register them without a role questionnaire.
- WHEN a member adds or removes Adopter, THE SYSTEM SHALL retain at least one valid role and update the profile.
- WHEN staff filters or exports members, THE SYSTEM SHALL include Adopter and preserve the legacy group.
- WHEN an Adopter joins, THE SYSTEM SHALL send the adoption steps and include any additional role steps in a mixed-role acknowledgement.

**Rules** · Existing rules allow one to four distinct known roles and reject invalid roles.  
**Files if needed** · `roles.js`, Join/Member/Adopt pages, `emailContent.js`, dashboard files, `firestore.rules`.  
**Checks** · Adopter-only, mixed roles, profile edits, email steps, legacy display, dashboard counts and rule cases. Any complete member profile can apply regardless of role.

### 2. Phase 4 workflow · Live verification

**Goal** · Confirm the four staff tabs support follow-up and export.

- WHEN staff chooses a valid quick action on Members, Adoption, Release or Messages, THE SYSTEM SHALL save the workflow change and private history together.
- WHEN staff logs a call, THE SYSTEM SHALL record the outcome and optional note. Only Reached advances status to Contacted.
- WHEN staff saves a private note or exports a filtered view, THE SYSTEM SHALL keep the note staff-only and export the matching rows with formula protection.
- WHEN staff opens Members, THE SYSTEM SHALL show stored email or a dash for missing data, and label the legacy chip No role (legacy).

**Rules** · Existing rules limit staff to workflow status and update metadata. Notes/history stay in `admin_notes`.  
**Files if needed** · `adminWorkflow.js`, `adminWorkflowService.js`, `adminDashboard.js`, staff components, `adminCsv.js`, `firestore.rules`.  
**Checks** · Quick actions in all four tabs, call outcomes, 1,000-character notes, filtered CSV and print, new and legacy members.

### 3. Availability · Live verification

**Goal** · Confirm conflicting approvals and stale forms are blocked.

- WHEN staff approves or completes an adoption, THE SYSTEM SHALL set Reserved or Adopted in the same transaction as status and history.
- WHEN a different request already holds the pet, THE SYSTEM SHALL refuse the conflicting approval.
- WHEN staff declines or reopens the holding approved request, THE SYSTEM SHALL release its reservation. Manual corrections require confirmation and append history.
- WHEN a pet is unavailable, THE SYSTEM SHALL hide it by default, disable its adoption action, and block direct and stale form submissions.

**Rules** · The existing create rule rejects Reserved, Adopted and archived pets. Availability is public read and staff write.  
**Files if needed** · Workflow service, AvailabilityControl, `petService.js`, Pets/Adopt pages, `firestore.rules`.  
**Checks** · Two competing approvals, completion, holder and non-holder decline, manual correction, public toggle, and availability change during submission.

### 4. Staff Add pet · Optional live verification, cut first if time is short

**Goal** · Verify laptop and phone publishing of staff-added pets.

- WHEN verified staff opens Add pet from either entry point, THE SYSTEM SHALL show the same four-step editor. Ordinary visitors and members shall see no staff action.
- WHEN staff uploads valid photos, THE SYSTEM SHALL validate input, crop to 4:3, compress, require alt text and credit, and save up to three photos with the profile.
- WHEN staff publishes, edits, archives or restores, THE SYSTEM SHALL reflect the saved state in the catalogue and credits. The public detail modal shall fetch extra photos by ID.

**Rules** · Existing staff-only profile/gallery writes validate fields, archive flag and photo limits. Public queries filter archived profiles.  
**Files if needed** · AddPetModal, AdminPets, `staffPetFields.js`, `staffPetService.js`, `imageProcessing.js`, catalogue and rules.  
**Checks** · Laptop dog with three photos, phone camera cat, HEIC message, Back and validation, gallery, credits, availability and archive/restore.

### 5. Final checks · Pending

**Goal** · Confirm submission readiness and finish coursework materials.

- WHEN someone visits `/components-demo`, THE SYSTEM SHALL show the existing 404.
- WHEN tested on desktop and mobile, THE SYSTEM SHALL support keyboard use, dark mode, and usable forms and staff screens.
- WHEN the latest Hosting and rules are deployed together, THE SYSTEM SHALL support the four forms, both emails and the correct staff tabs.

**Rules** · Deploy the current rules and Hosting together and run the applicable Playground checks.  
**Files if needed** · README, image credits, [review-report-outline.md](review-report-outline.md), recording script and any page exposed by a defect.  
**Checks** · Review and clear only confirmed test records. Confirm credits, placeholders and accessibility. Finish the PDF report and narrated recording links.

## 10. Known issues and TODOs

- The historical missing Members email was reported after Phase 1. Current Join writes Auth email and the table reads `record.email`. Records without email display a dash, and there is no backfill. The specific historical record and deployed fix are **UNKNOWN - verify**.
- The Other chip is already **No role (legacy)** locally. The components-demo route is already absent and covered by a 404 test. Current live test records and release state are **UNKNOWN - verify**.
- Many stock image credits in `images.js` still say **TO BE CONFIRMED**. README flags visible labels on two photos. Verify or replace before submission. Footer contact information and other sample details are fictional placeholders.
- Device camera, live EmailJS delivery, current rules, and deployed Phase 4B behaviour remain to be checked. Client cooldown is not a server-side rate limit.

## 11. Testing

Vitest uses jsdom and React Testing Library. `src/tests/setup.js` stubs fetch and scroll, cleans up the DOM, storage and theme, and resets mocks. `accountMocks.js` supplies auth listeners, in-memory Firestore queries, staff listeners and transaction writes. Integration tests stub `sendFormEmails` or the Firebase clients. `emailService.test.js` mocks the EmailJS SDK. `image-processing.test.js` mocks the browser bitmap and canvas APIs. Keep tests deterministic and independent of live data. Last result: **192 passing, 16 files**.

## 12. Conventions

- Small modifications, readable ES modules and descriptive names. Keep components PascalCase, hooks prefixed with `use`, and comments focused on why.
- Reuse components and validators. Keep data access in services and configuration in `src/data`. Use CSS variables and existing themes.
- Keep keyboard navigation, visible focus, semantic headings, associated labels, useful alt text, and accessible alerts. Preserve existing routes and mobile and dark-mode behaviour. Never expose secrets or private staff notes.
