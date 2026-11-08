# Pet Heaven

Pet Heaven is a React single-page web application concept for a Singapore animal-welfare society. It helps visitors learn about the society, browse available pets, register as supporters, and send adoption, release, or contact enquiries.

This is a university assignment project. Statistics, organisation details, stories, pet profiles, and some imagery are sample content and should be replaced with verified information before presenting the site as a real service.

## Features

- Home presents the society through action tiles, impact counters, care promises, adoption steps, featured pets, illustrative stories/news, and static ways to help.
- About presents numbered mission cards, a story timeline, facility and team imagery, adoption steps, FAQs, and visiting information.
- The pet gallery supports debounced search, filters including HDB-friendly, sorting, favourites, recently viewed pets, and a pet detail modal.
- Join, Adopt, Release, and Contact use a shared page banner and a desktop form-and-guidance layout that stacks on smaller screens. Existing forms provide inline validation, loading states, and submission feedback.
- The adoption enquiry checks membership saved in the same browser. It is a student demo flow, not secure account authentication.
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
| `/join` | Supporter registration and generated member ID |
| `/adopt` | Member check, saved draft, enquiry review, and confirmation |
| `/release` | Owner/pet support request with optional photo |
| `/contact` | General message form and contact information |
| `/privacy`, `/terms` | Static information about this coursework demonstration |
| `/credits` | Complete catalogue generated from `src/data/images.js` |
| Any other path | Friendly 404 page |

## Technology

- Vite, React, JavaScript, and React Router 6
- Plain CSS with shared variables; no CSS framework or component library
- EmailJS for administrator email when configured
- Firebase Firestore for optional remote pet and form data
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

Open the local address printed by Vite (usually `http://localhost:5173`). The app works with the sample pet data and browser storage when Firebase and EmailJS settings are left blank. Form submissions are retained in the current browser; they are not shared with other devices.

To build and preview the production version locally:

```powershell
npm run build
npm run preview
```

## Optional service setup

### EmailJS

1. Create an EmailJS service and a template for the project forms.
2. Put the service ID, template ID, and public key in `.env.local` using the variable names in `.env.example`.
3. Set the administrator recipient in the EmailJS dashboard, not in the React source.
4. Map the template fields to the parameters supplied by the form pages. For release photo uploads, configure the template's file attachment to use `petPhoto`.
5. Restart Vite after changing environment values. Use a test inbox/template while trying submissions.

EmailJS is not configured by default. Without its settings, the app can still validate and save submissions locally, but it will not email the administrator.

### Firebase and Firestore

Firebase is optional for local development. To use Firestore, create a Firebase project and web app, enable Firestore, then copy the web app settings into the matching `VITE_FIREBASE_*` entries in `.env.local`. The app reads pet documents from the `pets` collection and writes member, adoption, release, and contact records to their respective collections. If Firebase is not configured, pet profiles come from `src/data/pets.json` and form records use local storage.

The included [firestore.rules](firestore.rules) lets visitors read pet profiles and create validated form records, while blocking client reads of member and request records. It also blocks client writes to pet profiles; add or update those records through the Firebase Console or a trusted administrative setup. These rules are for an assignment demo and are not a complete production security design.

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

The suite covers route navigation, dropdown and mobile menu controls, newsletter validation, section links, pet search and HDB/species filtering, sorting/reset, empty results, favourite persistence, pet details and preselected adoption, membership validation and password handling, the non-member adoption check, release phone validation, contact submission, page banners, legal pages, and the generated image catalogue. Firebase and EmailJS are mocked in tests so they do not contact live services. Read the current command output for the test count and result; this README does not substitute for running the checks.

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
   firebase deploy --only hosting,firestore:rules
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
