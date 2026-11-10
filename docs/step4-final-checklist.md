# Step 4 final manual checklist

Use this checklist against the local production preview and, after a separate deployment, the public website. Mark only checks that you actually complete. The checklist is a testing guide, not a claim that every item has already passed.

## Prepare the app

From the Assignment3 project folder:

```powershell
npm ci
npm run build
npm test
npm run preview
```

Open the local URL printed by Vite. Use the browser console while navigating and check for application errors or warnings. Record the build/test output, browser, date, and any remaining issue. Development checks can also use `npm run dev`.

Use sample personal details. If EmailJS is configured, use a controlled test service/template and recipient. Confirm which mode you are checking: bundled pet data/browser storage, optional Firestore, and optional EmailJS. A locally saved form is not evidence of an administrator email being delivered.

## Desktop, tablet, and mobile layout

- [ ] At 1200px and wider, check the Navbar, dropdowns, page banners, section spacing, and form/guidance columns. Long labels and errors stay within their cards.
- [ ] At 900px, 600px, and a mobile width around 375px, check the intended responsive transition. Form guidance stacks in a readable order, inputs and buttons remain usable, and no page scrolls horizontally.
- [ ] Check Home, About, Pets, Join, Adopt, Release, Contact, Privacy, Terms, Credits, and a missing URL. Confirm one main `h1` per page and a sensible order for section/card headings.
- [ ] Toggle dark mode and revisit every page, including the pet modal, dropdowns, errors, success messages, helper panels, and footer. Text, borders, focus rings, and button states remain visible.
- [ ] Scroll the page and check the sticky header shrinks without overlapping content or causing horizontal movement.
- [ ] Enable reduced motion in the browser or operating system. Content remains visible, counters show a usable value, and decorative reveal/hover/chevron transitions do not animate.

## Keyboard and focus

- [ ] Use Tab from the top of the page. The skip link reaches the main content and every interactive control has a visible focus state.
- [ ] Open Navbar dropdowns with mouse and Enter; use ArrowDown, Tab, and Esc. Esc closes the submenu and restores trigger focus; Tab leaving it and clicking outside close it.
- [ ] Open the hamburger below the desktop breakpoint. Expand/collapse each submenu, follow a link, and confirm the mobile navigation closes.
- [ ] Follow an About or Sponsor section link. The intended section is visible below the header and keyboard focus continues from the destination.
- [ ] Use the FAQ Accordion and news Read more controls with the keyboard. Their open/closed states and content remain understandable.
- [ ] Open a pet detail modal. Check focus starts in the dialog, stays inside while tabbing, and returns after Esc/Close/Back to pets. Gallery buttons and favourite controls have meaningful names.

## Page and link checks

- [ ] Home is ordered as hero → action tiles → counters → promises → adoption process/checklist → featured pets → stories → news → sponsor/items → release CTA.
- [ ] About includes numbered mission cards, timeline, facility imagery, reusable adoption steps, team cards, FAQ, and opening hours/location information. Existing Navbar section anchors still land correctly.
- [ ] Follow every Navbar, footer, image tile, and Button link. Check Home, About sections, Available Pets, Adoption Process, Release a Pet, Join Us, Sponsor, Volunteer, Contact, Privacy, Terms, and Credits.
- [ ] Open `/pets/milo` directly and refresh it. Confirm the selected modal remains reachable through the SPA route, then close it to the gallery.
- [ ] Open a missing path, including `/components-demo`, and confirm the friendly 404 appears. There is no components-demo feature route.
- [ ] On the deployed site, refresh direct links such as `/about`, `/pets`, `/join`, and `/credits` to confirm the Hosting SPA rewrite works.

## Pet gallery

- [ ] Search by a sample name or breed and wait for the debounced result count. Clear the search.
- [ ] Combine species, age, gender, size, children, vaccination, and HDB-friendly filters. Check both HDB-friendly Yes and No; unknown remote values are not presented as confirmed suitability.
- [ ] Try the sort options, including name and age. Reset all filters and confirm the full sample list returns.
- [ ] Search for a value with no matches. Check the empty-state explanation and working Clear filters action.
- [ ] Toggle a favourite, enable favourites-only, and reload in the same browser. The selection persists. Recently viewed pets appear after opening profiles.
- [ ] Open a profile, switch gallery images, read health and temperament facts, and use its adoption action while signed out. Log in and check that the selected pet carries into the enquiry.

## Join form

- [ ] Submit the blank form and check required-field messages, linked error descriptions, and `aria-invalid` states.
- [ ] Try an invalid email, an invalid Singapore phone number, a weak password, a mismatched confirmation, a short address, and missing role or consent selections. Check the messages and retained input.
- [ ] Open each Get Involved role application link. Check the preselected card and conditional questions. Toggle a second role and try its validation.
- [ ] Use valid sample details, a strong matching password, at least one role, the 18+ confirmation and data consent. Submit once and check the membership card and email feedback.
- [ ] Check a second click during submission does not create a duplicate request. Saved member data and administrator email details must not contain the password or its confirmation.
- [ ] Log in with the same email and password on a phone. Check the membership card, print preview, My Details and sign-out menu. Edit a profile field and reload on the other device to confirm it saved.
- [ ] Open Forgot password and request a reset for an email address you control. Use the reset link and confirm you can sign in with the new password.

## Adopt form

- [ ] While signed out, open `/member` and `/adopt` directly. Both should send you to Login. Sign in and check that you return to the requested page.
- [ ] Check the prefilled name and phone, read-only account email, selected pet, household fields, commitments and progress note.
- [ ] Choose renting and check landlord permission appears and is required. Change back to owning and check the conditional field behaves as before.
- [ ] Leave required answers/commitments empty, enter a short experience/reason, or select a non-future interview date. Confirm the relevant validation messages and keep the form data.
- [ ] Enter a partial enquiry, reload while signed in, and check the draft is restored for that account. Try Clear saved draft and confirm the answers reset.
- [ ] Complete a valid enquiry using a future date/time. Open Review my enquiry, inspect the summary, use Edit answers, and verify the answers stay intact.
- [ ] Confirm and send once. Match the reference in both emails and in **My Requests** on the laptop and phone. Check the calendar link shows the preferred time and the email explains that staff will confirm the appointment.

## Release form

- [ ] Submit blank details and check owner, pet, reason, future handover date, and consent validation.
- [ ] Try an invalid phone, malformed email, negative pet age, and a reason explanation shorter than required. Check the messages and retained input.
- [ ] Try a non-image file and an image at or above 2 MB if the file picker permits selection. The optional photo must be an image strictly under 2 MB. A valid small image and no photo should both be acceptable.
- [ ] Complete valid owner/pet details and statuses, a sufficiently detailed reason, future handover date, and consent. Submit once and confirm the request reference and storage/email feedback.
- [ ] Verify the controlled recipient sees the photo filename and size in the admin email and that the form displays the local preview.

## Contact and newsletter

- [ ] Submit Contact blank and check required name/email/subject/message feedback. Try an invalid email, a message shorter than ten characters, and an invalid optional phone number.
- [ ] Submit valid sample contact details with a useful message. Confirm reference/storage/email feedback and that the form resets as before. Leaving the optional phone blank remains valid.
- [ ] Check contact information, the location/map area, opening hours, and social-channel explanation. Fictional contact information must not appear to be a real society's verified address or account.
- [ ] Submit the footer newsletter with blank and invalid emails, then a valid sample email. Confirm browser-only feedback and that the site does not claim a real mailing-list email was sent.

## Images, legal pages, and cleanup

- [ ] Open Privacy and Terms from the footer. Confirm their content explains the fictional coursework society and optional services.
- [ ] Open `/credits`. It must list every descriptor in `src/data/images.js`/`imageCredits`, including all 61 current local images.
- [ ] Verify visible images have meaningful alternative text, reserved dimensions/aspect ratios, and no broken file paths. Images below the initial view should load lazily; the visible hero/banner should load promptly.
- [ ] Scroll through images on a slow connection or with cache disabled and check that cards/banners reserve their space rather than jumping when pictures load.
- [ ] Keep the original, clearly labelled SVG photo placeholders until licensed photographs are supplied. Use [image-replacement-guide.md](image-replacement-guide.md) for all filenames, required sizes, search terms, and credit updates.
- [ ] Confirm the unused `PlaceholderPage.jsx`, its obsolete layout CSS, and the five `.gitkeep` markers in populated source folders have been removed. Retain real integration tests and the intentional image catalogue.

## Results record

| Check | Browser / width / mode | Date | Actual result / remaining issue |
| --- | --- | --- | --- |
| Production build | | | |
| Integration tests | | | |
| Desktop/tablet/mobile layouts | | | |
| Dark mode and reduced motion | | | |
| Keyboard, navigation, links, and modal | | | |
| Join invalid and successful submission | | | |
| Adopt sign-in gate, prefill, draft, review, and confirmation | | | |
| Release validation, photo, and confirmation | | | |
| Contact and newsletter validation/success | | | |
| Images, credits, direct route refresh, and console | | | |


## Verified during Step 4 — 7 November 2026

| Verification | Actual result |
| --- | --- |
| `npm run build` | Passed; Vite production bundle generated successfully |
| `npm test` | 49 tests passed across 3 integration-test files |
| Original behavior | Existing 28 test cases retained; all four pages' validation/state/handler prefixes and every original form/control prop compared unchanged |
| Shared logic | Data/EmailJS/Firebase services, useForm, validators, storage/pet hooks, Modal, Navbar and the corrected Dropdown remained unchanged |
| Responsive forms | Form-first stack at 375/600px; form-left and guide-right columns at 900/1200px; no horizontal overflow observed |
| Themes | All four form pages checked at 375/1200px in light and dark mode |
| All routes | Home, About, Pets, Join, Adopt, Release, Contact, Privacy, Terms, Credits and 404 checked at mobile/desktop sizes; one main h1 and reserved image dimensions |
| Form validation in browser | Join missing fields, non-member adoption gate, Release missing fields and Contact missing fields displayed correctly |
| Successful submissions | Existing Join/Contact success tests plus full Adopt/Release save and email-call tests passed with mocked services; no live email/database delivery was claimed |
| Adoption details | Automated member verification, draft retention/reset, renter consent, review, save, and calendar link passed |
| Release details | Automated MIME type, strict 2 MB limit, valid attachment metadata, save and existing EmailJS form-attachment call passed |
| Pets and modal | HDB No showed 5 of 18 sample pets; empty search showed 0; clearing restored results; modal Shift+Tab/Tab trapping, Escape and focus restoration passed in browser |
| About | Four mission cards, four reusable adoption steps, four facility images, four team images, FAQ and opening-hours block verified |
| Links and credits | Integration audit checked every rendered internal link/section target; Credits rendered all 61 image entries |
| Browser console | No errors or warnings observed in the local development preview after navigating and exercising the pages |
| Motion and loading | Existing reduced-motion rules retained; all image alt/dimension/lazy-loading contracts tested; iframe dimensions reserved. The manual slow-network and OS-preference checks above remain useful for additional devices. |

The storage hook's existing behavior resets the adoption draft to an empty initial record after submission; the test checks that submitted answers are cleared. No draft logic was changed. The intentionally labelled photo placeholders remain until licensed photos are supplied. These changes are saved locally and have not been pushed to GitHub or deployed to Firebase as part of Step 4.

## File changes and reasons

| File | Change | Reason |
| --- | --- | --- |
| [src/pages/AboutPage.jsx](../src/pages/AboutPage.jsx) | Reused StepCard for mission/adoption cards; refined timeline, photo cards and semantic hours block | Complete the About layout while preserving anchors, FAQ and banner |
| [src/styles/home-about.css](../src/styles/home-about.css) | Refined responsive About grids and spacing; removed team-avatar CSS and undefined spacing tokens | Keep inner-page design consistent and responsive |
| [src/components/forms/FormGuide.jsx](../src/components/forms/FormGuide.jsx) | Added shared labelled help panel and ordered next steps | Reuse guidance across all four forms |
| [src/pages/JoinPage.jsx](../src/pages/JoinPage.jsx) | Moved existing benefits beside the existing form | Provide registration guidance without changing logic |
| [src/pages/AdoptPage.jsx](../src/pages/AdoptPage.jsx) | Added form/guide columns and state-based progress display | Explain member, application and review stages |
| [src/pages/ReleasePage.jsx](../src/pages/ReleasePage.jsx) | Added supportive next-step sidebar | Make a long form easier to understand |
| [src/pages/ContactPage.jsx](../src/pages/ContactPage.jsx) | Added guide, reserved map dimensions and changed fictional email action to form anchor | Keep useful contact information and avoid an unusable mailto action |
| [src/styles/forms.css](../src/styles/forms.css) | Added desktop form/sidebar grids, mobile stacking and nested-grid width fixes | Maintain spacing and avoid overflow |
| [src/components/forms/SubmissionFeedback.jsx](../src/components/forms/SubmissionFeedback.jsx) | Replaced developer setup wording in the unsent-email message | Give visitors plain guidance while retaining delivery-status logic |
| [src/components/pets/PetCard.jsx](../src/components/pets/PetCard.jsx) | Changed card name heading from h2 to h3 | Keep card headings below section headings |
| [src/styles/pets.css](../src/styles/pets.css) | Styled results count consistently and constrained empty-state text width | Improve gallery scanning and visual consistency |
| [src/styles/layout.css](../src/styles/layout.css) | Removed obsolete placeholder-page styles | Clean up unused demo scaffolding |
| [src/main.jsx](../src/main.jsx) | Enabled supported React Router future flags | Eliminate the existing development migration warnings |
| [src/tests/inner-pages.integration.test.jsx](../src/tests/inner-pages.integration.test.jsx) | Added 21 integration cases for inner layouts, link/image/heading contracts, validation and full submissions | Verify the polish and preserve original behavior |
| [README.md](../README.md) | Updated routes, component structure, image folders/catalogue, credits and checklist links | Describe the current project accurately |
| [docs/step4-final-checklist.md](../docs/step4-final-checklist.md) | Added complete manual checks, actual verification results and this table | Provide a reviewable final handover |
| `src/pages/PlaceholderPage.jsx` | Removed unused scaffold | Unused placeholder page with no route or imports |
| `src/components/home/.gitkeep` | Removed unused scaffold | Folder now contains real project files |
| `src/components/pets/.gitkeep` | Removed unused scaffold | Folder now contains real project files |
| `src/data/.gitkeep` | Removed unused scaffold | Folder now contains real project files |
| `src/services/.gitkeep` | Removed unused scaffold | Folder now contains real project files |
| `src/tests/.gitkeep` | Removed unused scaffold | Folder now contains real project files |

The `/components-demo` route was already absent; its URL is covered by a regression test that expects the existing friendly 404. Privacy, Terms and Credits were already present and were verified instead of recreated.
