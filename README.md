# Pet Heaven

Pet Heaven is a React single-page web application concept for a Singapore animal-welfare society. It helps visitors learn about the society, browse available pets, register as supporters, and send adoption, release, or contact enquiries.

This is a university assignment project. Statistics, organisation details, stories, pet profiles, and some imagery are sample content and should be replaced with verified information before presenting the site as a real service.

## Features

- Home presents the society through action tiles, impact counters, care promises, adoption steps, featured pets, illustrative stories/news, and static ways to help.
- About presents numbered mission cards, a story timeline, facility and team imagery, adoption steps, FAQs, and visiting information.
- The pet gallery supports debounced search, filters including HDB-friendly, sorting, favourites, recently viewed pets, and a pet detail modal.
- Join, Adopt, Release, and Contact use a shared page banner and a desktop form-and-guidance layout that stacks on smaller screens. Existing forms provide inline validation, loading states, and submission feedback.
- Get Involved explains volunteer, foster and donor options and links to registration with the chosen role selected.
- Members sign in with Firebase Authentication and can open their profile, printable membership card and adoption requests on another device. Adoption uses their signed-in account and prefills their contact details.
- The app uses reusable UI, form, layout, and pet components, plus shared form and browser-storage hooks.
- Light and dark themes, keyboard-accessible navigation dropdowns/mobile accordions, breadcrumbs, route-aware page titles, visible focus states, and accessible form labels are included.
- Privacy, Terms, and a generated image Credits page are linked from the footer.
- Vitest and React Testing Library cover the original form/gallery journeys and the design-upgrade interactions.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home, news, sponsor information, and things we need |
| `/about` | Mission, story, facilities, adoption process, team, FAQ, and visiting information |
| `/pets` | Searchable and filterable adoption gallery |
| `/pets/:id` | Gallery with the selected pet's detail modal |
| `/get-involved` | Volunteer, foster, and donor or sponsorship information |
| `/join` | Account registration, member profile, and support roles |
| `/login`, `/forgot-password` | Sign-in and email password reset |
| `/member` | Protected membership card, resources, requests and profile editing |
| `/adopt` | Protected enquiry with profile prefill, draft, review and confirmation |
| `/release` | Owner/pet support request with optional photo |
| `/contact` | General message form and contact information |
| `/privacy`, `/terms` | Static information about this coursework demonstration |
| `/credits` | Complete catalogue generated from `src/data/images.js` |
| Any other path | Friendly 404 page |

## Technology

- Vite, React, JavaScript, and React Router 6
- Plain CSS with shared variables; no CSS framework or component library
- EmailJS for administrator notifications and user acknowledgements when configured
- Firebase Authentication for member accounts and Firestore for profiles, adoption requests and optional remote pet and public form data
- Browser local storage and bundled JSON as fallbacks
- Vitest, React Testing Library, and jsdom for integration tests
- Firebase Hosting configuration for optional deployment

## Requirements

Use Node.js `20.19+` within the 20.x series, or Node.js `22.12+`, as specified in `package.json`, and npm.

## Run locally

From the project folder in PowerShell:

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Open the local address printed by Vite (usually `http://localhost:5173`). With the Firebase settings blank, public pages use the bundled pet data and public forms can save browser copies. Configure Firebase to enable Join, Login, Member and Adopt. Configure EmailJS for the administrator notification and applicant acknowledgement.

To build and preview the production version locally:

```powershell
npm run build
npm run preview
```

## Form email and Firestore setup

### EmailJS

The outline requires administrator emails. Follow the [two ready-to-paste templates, dashboard samples and email checklist](docs/emailjs-templates.md). Set the administrator template's recipient in EmailJS and use `{{to_email}}` as the acknowledgement template's recipient.

Keep `VITE_EMAILJS_SERVICE_ID` and `VITE_EMAILJS_PUBLIC_KEY` in `.env.local`, and replace the four form-specific template IDs with `VITE_EMAILJS_TEMPLATE_ADMIN` and `VITE_EMAILJS_TEMPLATE_ACK`. Restart Vite after changing these values and rebuild before deploying.

Each form saves its record and sends the administrator notification first. After EmailJS accepts it for delivery, the app sends the user acknowledgement. A failed admin delivery shows an error and **Retry email** uses the saved reference and timestamp. Acknowledgement failure shows a separate warning. The hidden spam trap rejects filled entries before saving or sending. New attempts and retries share a 30-second browser cooldown.

Join's donor, volunteer and foster answers go to the administrator. Release previews its photo in the browser and sends the filename, size and urgency selection in the administrator notification. The free plan allows two templates and 200 requests a month. A completed admin and acknowledgement pair uses two requests. [EmailJS pricing](https://www.emailjs.com/pricing/)

### Firebase Authentication and Firestore

1. Open the existing `petheaven-b7766` project in the [Firebase Console](https://console.firebase.google.com/project/petheaven-b7766/firestore). Under **Databases & Storage → Firestore**, click **Create database**. Choose **Standard edition**, the **(default)** database and **Singapore (`asia-southeast1`)**. Select **Production mode**, then create the database. [Firebase setup guide](https://firebase.google.com/docs/firestore/quickstart) · [Firebase regions](https://firebase.google.com/docs/firestore/locations)
2. In **Project settings → General → Your apps**, select or register your web app. Copy its SDK config values to the matching `VITE_FIREBASE_*` entries in `.env.local`.
3. Open **Authentication → Sign-in method** and enable **Email/Password**. The site keeps sign-in state on the current browser until the member signs out. [Firebase email and password setup](https://firebase.google.com/docs/auth/web/password-auth) · [Firebase auth persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence)
4. From the project folder, deploy the checked-in rules with the Firebase CLI and restart Vite.

   ```powershell
   firebase.cmd deploy --only firestore:rules --project petheaven-b7766
   npm.cmd run dev
   ```

`authService.js` sends credentials to Firebase Authentication. `memberService.js` stores the member's editable profile and display member ID in `members/{uid}`. Adoption requests include that UID and the display member ID. My Requests queries by UID and can show a matching browser copy when Firestore is unavailable. `petService.js` continues to use `pets.json` as the bundled pet fallback. Release and Contact keep their existing storage behavior.

The [rules](firestore.rules) let each signed-in member access their own profile and adoption requests and update only permitted profile fields. Release and Contact accept validated public submissions, while administrator reads, request edits and client deletes are denied. [Firestore rule operations](https://firebase.google.com/docs/firestore/security/rules-structure)

The previous member IDs and email hashes were lookup records. Anyone who joined with that flow must create an account with a password. The old documents can remain in Firestore and the app's account queries use the Firebase UID.

For a live check, register on a laptop, then sign in on a phone using the hosted build and the same email and password. Open an available pet, send an adoption enquiry and check My Requests on both devices. Match both emails to the reference, then sign out and verify that the Member and Adopt routes redirect to Login.

## Tests

Run the integration suite with:

```powershell
npm test
```

Check that every referenced local image exists before building or deploying:

```powershell
npm run check:images
```

For watch mode while editing:

```powershell
npm run test:watch
```

The suite covers route navigation, dropdown and mobile menu controls, newsletter validation, pet gallery and filters, protected account routes, sign-in and registration, role-specific fields, adoption prefill and requests, public forms, page banners, legal pages, and the image catalogue. Tests mock Firebase and EmailJS.

Use the [final manual checklist](docs/step4-final-checklist.md) to check desktop, mobile, dark mode, keyboard access, links, and every form. Automated tests exercise the app with mocked services; actual EmailJS delivery and Firestore access require separate checks against your configured projects.

Use the [photo wiring checklist](docs/photo-wiring-checklist.md) for the stock-photo update, including image failures, crops, credits, and the unchanged form and gallery journeys. Its boxes are intentionally unchecked until someone performs each check.

## Deploy with Firebase Hosting (optional)

Firebase is one hosting choice, not a requirement of the core React application. The assignment asks for a deployed URL in the review report; Firebase Hosting or another platform can provide it.

1. Configure `.env.local` if the deployed app should use EmailJS or Firestore. Do not add private server credentials to browser environment variables.
2. Build and check the app:

   ```powershell
   npm ci
   npm run test
   npm run build
   ```

3. Install and sign in to the Firebase CLI, then choose the Firebase project:

   ```powershell
   npm install -g firebase-tools
   firebase login
   firebase use --add
   ```

4. Deploy Hosting and the Firestore rules:

   ```powershell
   firebase deploy --only firestore:rules,hosting
   ```

   If you are only using Hosting and do not want to deploy Firestore rules, run `firebase deploy --only hosting` instead.

The [firebase.json](firebase.json) file publishes the `dist` build folder and rewrites app routes to `/index.html`, which lets BrowserRouter routes load directly and survive refreshes. After deployment, copy the public URL into the review report. A Hosting configuration file alone does not deploy the site.

## Project structure

```text
src/
  components/
    layout/     Navbar, Footer, Brand, SocialLinks, theme and scroll controls
    ui/         Button, Card, Badge, Alert, Modal, Accordion, Dropdown, Breadcrumb, PageBanner, FallbackImage
    forms/      Shared form fields, page shell, guidance, and submission feedback
    home/       ImageTile, StepCard, StatCounter, NewsCard, StoryCard, RandomPetPhoto
    pets/       Cards, detail modal, search, filters, and favourite controls
  data/         pets.json plus images.js metadata/credits catalogue
  hooks/        Form, pet-data, and local-storage hooks
  pages/        Main pages, Privacy, Terms, Credits, and 404
  services/     EmailJS and optional Firebase/data access
  styles/       Global, component, page, and responsive styles
  tests/        Integration test setup and user-journey tests
  utils/        Validation and form/pet helpers
public/
  images/
    hero/       Home hero image
    tiles/      Adopt, Release, Join, and Sponsor action images
    pets/       Pet portraits and lifestyle/gallery images
    facilities/ Shelter, veterinary, play, and recovery images
    stories/    Illustrative success-story images
    team/       Team-role images
    banners/    About, Pets, Join, Adopt, Release, and Contact banners
    news/       Static news-card images
docs/           Report outline, narration script, image guide, upgrade notes, and final checklist
```

Existing components are extended and reused across the pages. `StepCard` supports the Home and About process/mission sections; `PageBanner` and `Breadcrumb` share the inner-page introductions; the form shell and guidance keep the four form pages consistent without owning their validation or submission logic.

## Images and credits

The primary site photos are local files in `public/images/{hero,tiles,banners,pets,facilities,stories,team,news}`. The supplied collection contains 42 downloaded stock photos; the 61 original SVG illustrations are retained for fallbacks. Hero, banner, pet, facility, story, team, tile, and news photos do not depend on an external image service. The optional `RandomPetPhoto` strip remains separate: it uses Dog CEO API and TheCatAPI for random photos, with local illustration fallbacks.

[src/data/images.js](src/data/images.js) records each image's local `path`, descriptive `alt`, actual `width` and `height`, and `credit` fields `photographer`, `source`, `url`, and `licence`. The `/credits` page is generated from the complete `imageCredits` export, grouped by section with thumbnails and filenames. Unknown credit fields use the exact value **TO BE CONFIRMED**. Information inferred from an identifiable stock-site filename is labelled **from filename**; a descriptive renamed filename does not establish its photographer, original page, or licence. The visible **Credits being confirmed** note identifies incomplete entries.

The [image replacement guide](docs/image-replacement-guide.md) retains the original slot sizes and search suggestions. When replacing a photo, update its path, actual-photo alt text, dimensions, credit fields, and `placeholder` flag together. Do not invent credit details or treat a downloaded stock photo as a photograph of Pet Heaven's fictional animals, adopters, facilities, or team. Verify the original source and usage terms before submission. The visible labels on `facilities/facility-vet.jpg` and `stories/story-01.jpg` have not been removed; confirm their source and permission or replace those files.

`FallbackImage` keeps the image frame stable and substitutes a local SVG illustration if a local photo cannot load. Photos use fixed crops and width/height attributes; the Home hero loads with high fetch priority, while other site photos load lazily. For a pet photo, also update the matching `image` and `gallery` paths in `pets.json`, plus remote Firestore records if they are used. Each current gallery uses its one supplied photo rather than displaying an unrelated second animal. There are ten dog photos and eight cat photos for nine dog and nine cat profiles, so one cat photo is reused; replace it with another suitable cat photo when available. Three team photos serve four fictional team roles, with reuse identified as illustrative stock imagery.

The HDB-friendly flag is explicit sample data for the coursework. It is not a housing approval. A remote pet record without that field displays **Not assessed** under the unfiltered gallery; add a verified field value to the record before using Yes/No filtering for it.

## Before submission

- Replace sample organisation details, statistics, and illustrative stories with clearly identified project assumptions or verified information.
- Confirm every stock-photo credit, replace any unsuitable or unverified photo, and review reused pet/team photos.
- Complete the [desktop/mobile/dark-mode and form checklist](docs/step4-final-checklist.md), recording only checks actually performed.
- Test EmailJS only with a controlled test recipient; verify the deployed form behavior.
- If using Firestore, check the deployed rules and confirm the collections are populated as intended.
- Add the actual deployed website URL to the report and record the walkthrough using the six-minute script in `docs/screen-recording-script.md`.
