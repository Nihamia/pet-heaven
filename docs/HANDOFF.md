# Pet Heaven handoff

Local baseline after Phase 4B. This document uses project files and prior observed results. Live state is labelled separately. A continuation should verify rather than rebuild finished features.

## 1. Assignment constraints

- ISIT207 Assignment 3, individual work. Due **15 Nov 2026 at 23:50 SGT**. Late penalty **25% per day**.
- Part A is the React web app. Part B is a PDF review report and narrated screen recording with the required links. The repository includes a six-minute draft script.
- Unacknowledged material counts as plagiarism. Verify photo credits, licences, and sources. Identify Pet Heaven as a fictional Singapore charity.
- Focus on component reuse, SPA behaviour, validation, usability, and design. Hosting, searching and browsing, database integration, and integration tests are extra-credit areas.

## 2. Run, build, test and deploy

Exact folder:

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
| Design steps 1–4 and chevrons | Done | Responsive nav, banners, Home/inner pages, accessible dropdowns, footer and credits |
| Image scan and apply | Done | Local assets, metadata, lazy images, fallback and path check. Credit verification remains |
| Random photos and auto-advance | Done | Optional dog/cat photo strip with cycling, fallback, and mocked tests |
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
| Test data resets | Done | Prior reset kept staff and removed test members/logins, release request and message. Current records are UNKNOWN - verify |

Last recorded result after Phase 4B on 10 Nov 2026 was **192 tests passed across 16 files**, production build passed, and 19 synthetic Firestore rule simulations matched expectations. No checks were rerun for this handoff. Read-only Git status before writing showed **main, ahead of origin/main by 1, with modified and untracked files**. The four handoff files add local documentation.

## 4. Architecture snapshot

| Area | Routes and implementation |
| --- | --- |
| Public | `/`, `/about`, `/get-involved`, `/pets`, `/pets/:id`, `/join`, `/login`, `/forgot-password`, `/release`, `/contact`, `/privacy`, `/terms`, `/credits`, wildcard 404. The pet detail modal is route-backed. |
| Member | `/member` and `/adopt` require Auth. `/member#requests` shows My Requests. Join can resume a partial registration. `ProtectedRoute`, `AuthContext`, `authService`, `memberService`, `useForm`. |
| Staff | `/admin/login`, `/admin`, `/admin/members`, `/admin/adoption`, `/admin/release`, `/admin/messages`, `/admin/pets`. `AdminRoute`, `AdminAuthContext`, `AdminWorkflowContext`, `AdminLayout`, `DataTable`, `DetailPanel`, `AdminPets`, `adminDataService`, `adminWorkflowService`. |
| Shared catalogue | `usePets` and `petService` load legacy Firestore pets or bundled `pets.json`, merge public staff pets by ID, and overlay availability. `PetCard`, `PetDetailModal`, `AddPetModal`, `staffPetService`, `imageProcessing`, `images.js`. |
| Forms and config | `FormField`, `FormPageShell`, `RoleCard`, `SubmissionFeedback`, `useAdminSubmission`, `validators`, `dataService`, `referenceService`, `emailContent`, `emailService`, `firebaseClient`. Data config includes `roles.js`, `staffPetFields.js`, `adminDashboard.js`, and `adminWorkflow.js`. |

## 5. Firestore data model

All collections below are wired locally. Firestore collections appear when populated. Historical live records were observed for `members`, `release_requests`, `contact_messages`, and `admins`. Current contents of every collection, and live presence of the other collections, are **UNKNOWN - verify**. The field lists describe current code and rules, with the legacy pet schema inferred from the actual bundled fixture.

`request metadata` below means `referenceId, referenceNo, type, status, createdAt, updatedAt, updatedBy`.

| Collection / ID | Fields |
| --- | --- |
| `members/{uid}` | `uid, memberId, firstName, fullName, phone, address, roles, status, createdAt, ageConfirmed, dataConsent, newsletter`. New records add `email, roleDetails, updatedAt`. Staff may add `staffStatus, updatedBy`. |
| `adoption_requests/{autoId}` | Request metadata plus `userId, memberId, applicantName, email, phone, petId, petName, housingType, tenure, landlordPermission, householdMembers, otherPets, experience, workSchedule, reason, commitmentLongTerm, commitmentFinancial, interviewConsent, preferredDate, preferredTime`. |
| `release_requests/{autoId}` | Request metadata plus `ownerName, email, phone, petName, petSpecies, petBreed, petAgeYears, petGender, petSize, petColour, vaccinated, sterilised, microchip, healthNotes, behaviourNotes, reason, reasonDetails, handoverDate, photoFileName, photoFileType, photoFileSize, consent, urgent`. |
| `contact_messages/{autoId}` | Request metadata plus `name, email, phone, subject, message`. |
| `pets/{petId}` | Read-only remote source. Bundled shape `id, name, species, breed, ageYears, ageGroup, gender, size, colour, vaccinated, sterilised, goodWithKids, goodWithPets, hdbFriendly, temperament, story, healthNotes, status, image, gallery, dateAdded`. Exact legacy live fields **UNKNOWN - verify**. |
| `admins/{uid}` | Document existence authorises staff. No field is required by the app or rule. Provisioned outside the client. |
| `admin_notes/{collection}_{docId}` | `updatedAt, updatedBy` and `text` and/or `history`. Text max 1,000. History entries `action, fromStatus, toStatus, outcome, note, at, by`. |
| `pet_availability/{petId}` | `status, updatedAt, updatedBy`, optional `adoptionRef`. Status is Available, Reserved or Adopted. Public `updatedBy` is a staff UID. |
| `staff_pets/{petId}` | `id, name, species, breed, gender, ageYears, ageMonths, ageGroup, size, colour, vaccinated, sterilised, microchip, goodWithKids, goodWithPets, hdbFriendly, energyLevel, temperament, story, healthNotes, specialNeeds, image, imageAlt, photoCredit, source, archived, createdBy, createdAt, updatedAt`. `photoCredit` holds `type, photographer, source, url`. |
| `pet_images/{petId}` | `gallery, alts`, parallel arrays of up to two extra photos. |

- The app uses Firestore auto IDs for the three request/message collections and a separate human reference. Member docs are keyed by Auth UID. New member references are `PH-XXXXXX`. Request references are `AD/RL/CT-YYYY-XXXX`. Email retry reuses the saved record, reference and ISO timestamp.
- `createdAt` and workflow dates remain ISO strings. `members.status` stays Active. Staff uses `staffStatus`, with missing values displayed as New. Adoption starts Submitted and displays New.
- Roles are arrays of lowercase IDs `adopter, volunteer, foster, donor`. Rules also accept their exact display labels. `roleDetails` uses lowercase keys for the three questionnaire roles. Adopter has no questionnaire. Older members may lack newer fields.
- Notes and history live in `admin_notes`, separate from owner-readable records.

## 6. Security rules

`isAdmin()` checks whether `admins/{request.auth.uid}` exists. Client deletes are denied across these collections.

| Collection | Reads | Create and update |
| --- | --- | --- |
| members | Own get, admin get/list | Owner validates create and edits name, phone, address, roles. Staff edits only staffStatus and update metadata. |
| adoption_requests | Own get and owner-filtered list, admin get/list | Signed-in owner creates with matching profile and email, and available unarchived pet. Staff edits status and update metadata. |
| release_requests, contact_messages | Admin get/list | Public validated create. Staff edits status and update metadata. |
| pets | Public read | Client writes denied. |
| admins | Own get only | Client writes denied. |
| admin_notes | Admin get/list | Admin validates note and append-only history changes. |
| pet_availability | Public get/list | Admin validates status and metadata. |
| staff_pets | Admin get/list, public reads only unarchived and lists with the archive filter | Admin creates and updates validated records, preserving creator and creation date. |
| pet_images | Public get by ID, list denied | Admin creates/updates validated gallery. |

Confirmed simulator work: Phase 4 availability rules compiled. Adopter had 22 synthetic create/update outcomes covering accepted labels and IDs, invalid and empty roles, duplicates and size bounds. Phase 4B had 19 outcomes covering public published/archived gets, write denials for public/member, staff create/edit/archive/restore, invalid species, image size, required archived flag, gallery permissions and photo/alt consistency. Other live Playground outcomes are **UNKNOWN - verify**. Expected cases are in [staff-access.md](staff-access.md).

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

Items 1–4 are already implemented locally. The following mini-specs describe remaining verification. Preserve their implementation and only change it if verification exposes a defect.

1. **Adopter.** Goal: an adoption-only member journey. WHEN a visitor selects only Adopter, THE SYSTEM SHALL register them without volunteer, foster or donor questions. WHEN a valid member signs in, THE SYSTEM SHALL allow adoption regardless of role. Rules: already allow the four distinct roles. Files if needed: `roles.js`, Join/Member/Adopt pages, `emailContent.js`, dashboard config and rules. Tests: Adopter-only and mixed signup, email steps, role filters/CSV, legacy profiles and rule cases.
2. **Phase 4 staff workflow.** Goal: verify follow-up on live records. WHEN staff takes a quick action, THE SYSTEM SHALL update the workflow and append history together. WHEN a call does not reach the applicant, THE SYSTEM SHALL keep the status and record its outcome. Verify notes, filtered CSV/print, new-member email, and No role (legacy). Rules: staff workflow fields and private notes only. Files if needed: `adminWorkflow.js`, `adminWorkflowService.js`, dashboard components and rules. Tests: four tabs, call outcomes, field limits, export and old profiles.
3. **Pet availability.** Goal: verify conflict-safe adoption. WHEN staff approves or completes, THE SYSTEM SHALL reserve or adopt the pet in the same transaction as the request and history. WHEN another request holds the pet, THE SYSTEM SHALL reject approval. WHEN the owning approved request is declined/reopened, THE SYSTEM SHALL release its reservation. WHEN a member submits for an unavailable pet, THE SYSTEM SHALL block the request. Rules: existing pet guard. Files if needed: workflow service, catalogue/Adopt, rules. Tests: competing approvals, completion, release, direct links and mid-submit changes.
4. **Staff Add pet (optional, cut first if time is short).** Goal: verify live laptop and phone publishing. WHEN staff publishes a valid dog/cat with up to three photos, THE SYSTEM SHALL save profile and gallery atomically and display it publicly. WHEN staff archives/restores, THE SYSTEM SHALL hide/return the listing. Rules: existing staff and photo validation. Files if needed: AddPetModal, AdminPets, staff pet service, image processing and rules. Tests: camera/HEIC messaging, compression, validation/back, staff access, lazy gallery, archive and credits.
5. **Submission readiness.** Goal: validate the deployed site and finish coursework materials. WHEN tested on desktop/mobile, THE SYSTEM SHALL support keyboard navigation and show the expected forms, staff checks and delivery. WHEN a visitor requests `/components-demo`, THE SYSTEM SHALL show 404. Confirm test data cleanup without deleting staff or pet data, credits and placeholder copy, README, [review-report-outline.md](review-report-outline.md) and narrated recording. Rules: deploy current rules with Hosting and smoke test. Files if needed: credits, README, coursework docs and affected pages. Tests: existing suite plus live desktop/mobile, dark mode, four forms and both emails.

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
