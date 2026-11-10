# Pet Heaven staff access

## Set up the first staff account

1. In the PetHeaven Firebase project, open **Authentication → Sign-in method** and enable **Email/Password** if needed.
2. In **Authentication → Users**, use an existing staff account or choose **Add user** and enter a dedicated staff email address you control. Set the password privately in Firebase. For an existing account, use that account's password or a password reset. [Firebase user management](https://firebase.google.com/docs/auth/web/manage-users)
3. Copy the user's **UID** from the Authentication Users list.
4. In **Firestore Database → Data**, create a document at `admins/{uid}` using the exact Auth UID as the document ID. If the console requires a field, add a string field called `role` with the value `staff`. The rules and app check that the document exists. [Firestore documents](https://firebase.google.com/docs/firestore/manage-data/add-data)
5. Sign in at `/login` or `/admin/login` with the email and password from step 2. Both open the staff overview for an authorised account. Provision staff access through the Firebase Console. The client rules deny writes to the allowlist.

The staff area uses the same Firebase browser session as the member site. The normal login checks the allowlist before choosing a destination. Members continue to their original destination, such as an adoption form, and an unavailable staff check grants no staff access. Opening a staff route with a signed-in account outside the allowlist ends that session and displays an access error.

## Staff dashboard

The overview and tabs use the same four live Firestore listeners. Each collection loads up to 500 documents ordered by `createdAt` descending. A separate one-time server read samples up to 500 documents per collection to find records missing `createdAt`. The dashboard deduplicates by document ID, sorts undated rows last, and shows a dash for missing values. The supplemental sample is bounded, and its undated results are refreshed when the staff area is reopened. Counts reflect the loaded records.

Open each tab, try role and status filters, search, sort, and use **View** on a row to open its details. On a narrow screen, use the staff menu above the content and scroll the table horizontally. Press **Escape** to close details and return focus to the row button.

## Staff pet management

Use Pets in the staff dashboard to add, edit, archive, restore, or change the availability of a staff-added profile. The public Pets page also offers Add pet after staff verification. The editor creates the profile and its separate extra-photo document in one transaction. The main photo lives with the profile. Extra photos are read by document ID when a visitor opens details or staff opens the editor.

Choose JPEG, PNG or WebP. The browser crops to 4:3, limits width to 1,000 pixels, and caps the encoded photo at 150 KB. Add alt text to each photo and use one accurate credit for the set. If a phone supplies HEIC, export as JPEG before uploading.

Archiving hides a staff profile and its credit from the catalogue and blocks new adoption submissions for that pet. Restoring preserves the existing availability. The gallery document still permits a public get by ID, as specified for the separate gallery collection. Bundled and legacy Firestore profiles keep their existing read-only source.

### Rules Playground cases for pets

| Operation | Actor | Expected |
| --- | --- | --- |
| Get a staff pet with archived = false | Signed out | Allow |
| Get a staff pet with archived = true | Signed out | Deny |
| List staff pets with where archived == false | Signed out | Allow |
| List staff pets without the archive filter | Signed out | Deny |
| Create or update a staff pet with otherwise valid fields | Signed out or signed-in member | Deny |
| Create a valid active staff pet with own UID | Admin | Allow |
| Update or archive the same staff pet while preserving its creator and creation date | Admin | Allow |
| Create with species other than Dog or Cat, missing archived, or a photo string at least 250,000 characters | Admin | Deny |
| Get a gallery by document ID | Public | Allow |
| List or delete gallery documents | Anyone | Deny |

## Deploy from Assignment3

```powershell
npm.cmd run build
firebase.cmd deploy --only firestore:rules,hosting --project petheaven-b7766
```

Publish the rules and Hosting together. With earlier rules, staff-pet and gallery reads and writes are denied. The existing catalogue remains available through its regular source.

## Rules Playground cases

Use disposable accounts and records. The staff UID needs a document in `admins`. For create requests and staff updates that check the account email, use an authenticated test client or emulator if your simulator does not let you supply the email claim. Use the same approach for collection queries if the simulator only supports document operations. [Firebase Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

| Path and operation | Actor | Expected |
| --- | --- | --- |
| Get `admins/{ownUid}` | Signed-in account with that UID | Allow |
| List `admins`, get another user's admin document, or write any admin document | Client account | Deny |
| Create a valid `release_requests/{id}` or `contact_messages/{id}` with `status: New` | Signed out | Allow |
| Create in `members`, `adoption_requests`, or `admin_notes` | Signed out | Deny |
| Get or list any submission collection | Signed out | Deny |
| Get or create own member profile with valid initial fields | Member | Allow |
| Update own profile contact details or selected roles | Member | Allow |
| Update own `status` or `staffStatus` | Member | Deny |
| Get own adoption request or query adoption requests with own `userId` | Member | Allow |
| Get another member's adoption request, list unfiltered requests, or update request status | Non-admin | Deny |
| Get and list `members`, `adoption_requests`, `release_requests` and `contact_messages` | Staff | Allow |
| Update only `staffStatus` for a member or `status` for a request, with an ISO `updatedAt` and own staff email as `updatedBy` | Staff | Allow |
| Change submitted request details or a member's account status | Staff | Deny |
| Get, list, create or update a valid `admin_notes/{collection}_{docId}` with `text` up to 1,000 characters and valid update metadata | Staff | Allow |
| Get, list, create or update `admin_notes` | Non-admin | Deny |
| Delete documents in the above collections | Client account | Deny |

### Member roles

For create tests, authenticate as the UID in the document path and use a matching email claim. Start with an otherwise valid registration payload. For owner updates, start with an existing member document and change only its roles.

| Role list | Create | Owner update |
| --- | --- | --- |
| ["Adopter"] | Allow with roleDetails = {} | Allow |
| ["Adopter", "Donor"] | Allow with valid roleDetails.donor | Allow |
| ["Volunteer"] | Allow with valid roleDetails.volunteer | Allow |
| ["adopter", "volunteer", "foster", "donor"] | Allow with all three questionnaires | Allow |
| ["Admin"], ["Other"], [] or a non-list value | Deny | Deny |
| ["adopter", "Adopter"] or more than four entries | Deny | Deny |

The site writes lowercase role IDs. The rules also accept the corresponding labels above and require distinct roles. Adopter has no questionnaire. An adoption request is tied to the signed-in owner and matching member profile regardless of membership roles.

## Workflow and pet availability

Open a row or use its quick actions. **Mark called** records the outcome and optional note. A reached call advances the status to Contacted. The other outcomes leave the status as it was. Staff notes and call history are stored under the matching document in `admin_notes`.

Approving a request reserves the pet for that request. Completing it marks the pet adopted. An approval or completion is refused if another request holds the pet. Declining or reopening an approved request releases its own reservation. Each action commits its changes and private history in one Firestore transaction.

Use **Change availability** in adoption details for a confirmed manual correction. That control changes availability and logs the correction while preserving the request status. Public availability records use the staff UID for `updatedBy`. Private history records keep the staff email.

**Export filtered CSV** and **Print** use all matching rows, including rows beyond the current page.

| Rules Playground path and operation | Actor | Expected |
| --- | --- | --- |
| Get or list `pet_availability` | Signed out | Allow |
| Create or update `pet_availability/{petId}` | Signed out or signed-in non-admin | Deny |
| Create a valid Adopted record with an ISO `updatedAt` and own staff UID as `updatedBy` | Staff | Allow |
| Set Adopted while also writing a field outside the availability schema | Staff | Deny |
| Get `admin_notes/{collection}_{docId}` for an owned record | Member without staff access | Deny |
| Delete an availability record | Client account | Deny |
| Create an otherwise valid adoption for a Reserved or Adopted pet | Eligible signed-in member | Deny |
| Create an otherwise valid adoption for an Available pet or a pet with no overlay document | Eligible signed-in member | Allow |

Deploy Hosting and rules together. With older rules, staff can open the dashboard, but pet availability and new history writes are denied. A denied transaction leaves the status and availability as they were. Rules from the earlier version of Phase 4 reject Reserved writes and do not enforce the Reserved check on adoption creates.
