# Pet Heaven

Pet Heaven is a React single-page web application concept for a Singapore animal-welfare society. It helps visitors learn about the society, browse available pets, register as supporters, and send adoption, release, or contact enquiries.

This is a university assignment project. Statistics, organisation details, stories, pet profiles, and some imagery are sample content and should be replaced with verified information before presenting the site as a real service.

## Features

- Home and About pages explain the society, care approach, adoption process, facilities, and FAQs.
- The pet gallery supports debounced search, filters, sorting, favourites, recently viewed pets, and a pet detail modal.
- Join, Adopt, Release, and Contact forms provide inline validation and submission feedback.
- The adoption enquiry checks membership saved in the same browser. It is a student demo flow, not secure account authentication.
- The app uses reusable UI, form, layout, and pet components, plus shared form and browser-storage hooks.
- Light and dark themes, responsive navigation, route-aware page titles, and accessible form labels are included.
- Vitest and React Testing Library cover ten user journeys.

## Technology

- Vite, React, JavaScript, and React Router 6
- Plain CSS with shared variables; no CSS framework or component library
- EmailJS for administrator email when configured
- Firebase Firestore for optional remote pet and form data
- Browser local storage and bundled JSON as fallbacks
- Vitest, React Testing Library, and jsdom for integration tests
- Firebase Hosting configuration for optional deployment

## Requirements

Use Node.js `20.19+` or `22.12+`, as specified in `package.json`, and npm.

## Run locally

From the project folder in PowerShell:

```powershell
npm ci
Copy-Item .env.example .env.local
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
npm run test
```

For watch mode while editing:

```powershell
npm run test:watch
```

The suite covers route navigation, pet search and filters, the empty state, favourite persistence, membership registration and password handling, the non-member adoption check, release phone validation, and contact submission. Firebase and EmailJS are mocked in tests so they do not contact live services.

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
  components/   Shared layout, form, UI, and pet components
  data/         Bundled sample pet profiles
  hooks/        Form, pet-data, and local-storage hooks
  pages/        Home, About, Pets, Join, Adopt, Release, Contact, and 404 pages
  services/     EmailJS and optional Firebase/data access
  styles/       Global, component, page, and responsive styles
  tests/        Integration test setup and user-journey tests
  utils/        Validation and form/pet helpers
docs/           Review-report outline and narration script
```

## Before submission

- Replace sample organisation details, statistics, and illustrative stories with clearly identified project assumptions or verified information.
- Replace sample pet imagery with credited images and check every image credit.
- Test EmailJS only with a controlled test recipient; verify the deployed form behavior.
- If using Firestore, check the deployed rules and confirm the collections are populated as intended.
- Add the actual deployed website URL to the report and record the walkthrough using the six-minute script in `docs/screen-recording-script.md`.
