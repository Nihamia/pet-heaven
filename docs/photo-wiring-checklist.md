# Stock-photo wiring manual checklist

This checklist records checks to perform, not checks already completed. Test the local production preview and repeat the important journeys on the deployed site after deployment. Use sample information and a controlled recipient for any real email-delivery check.

## Viewports and themes

Run every page check below in each combination. Start at approximately 1200 px desktop width and 375 px mobile width; also resize through 600 px and 900 px to inspect layout changes.

| Page | Desktop light | Desktop dark | Mobile light | Mobile dark |
| --- | --- | --- | --- | --- |
| Home | [ ] | [ ] | [ ] | [ ] |
| Pets | [ ] | [ ] | [ ] | [ ] |
| About | [ ] | [ ] | [ ] | [ ] |
| Join | [ ] | [ ] | [ ] | [ ] |
| Adopt | [ ] | [ ] | [ ] | [ ] |
| Release | [ ] | [ ] | [ ] | [ ] |
| Contact | [ ] | [ ] | [ ] | [ ] |
| Credits | [ ] | [ ] | [ ] | [ ] |

## Home

- [ ] Hero photo loads with high fetch priority, a stable frame, readable overlay text, and no blocked subject at desktop or mobile width.
- [ ] Adopt, Release, Join, and Sponsor tiles show the intended photos, crop cleanly, and keep their working destinations.
- [ ] Featured pet photos match their names and the corresponding Pets cards/detail view.
- [ ] Story and news cards show the intended local files; story photos remain clearly illustrative.
- [ ] Sponsor/release controls and the newsletter still work as before.
- [ ] The optional random dog/cat strip still refreshes, pauses/resumes, and expands/collapses; API failure shows a local illustration.

## Pets

- [ ] Banner, cards, image badges, results count, and empty state remain readable in both themes and at both widths.
- [ ] Search, species, age, size, gender, HDB-friendly filters, sorting, and Reset still give consistent results.
- [ ] Favourite/unfavourite works and survives a page refresh in the same browser.
- [ ] View details opens the correct pet and photo; keyboard close, outside click, and gallery controls work without a broken image.
- [ ] The supplied single-photo galleries do not imply that unrelated animals are the same pet. Check the profile using a reused cat photo and replace it when another suitable photo is available.
- [ ] Adopt from a pet detail view still preselects the correct pet.
- [ ] Species and visible colour look consistent with each profile; flag doubtful breed/size matches for review rather than assuming physical traits can be verified from a photo.

## About

- [ ] Banner, facility cards, and team cards load and crop without stretching or hiding the main subject.
- [ ] Facility and team photos are clearly illustrative stock photos, including any reused team photo.
- [ ] Numbered mission cards, timeline, adoption steps, FAQ accordion, hours, and location remain usable.
- [ ] Inspect the visible label on `facilities/facility-vet.jpg`; confirm the original source and permission or replace the photo without removing the label.

## Join

- [ ] Banner and two-column form/help layout fit desktop; mobile stacks without horizontal scrolling.
- [ ] Submitting empty or invalid fields still shows useful inline errors and moves focus as expected.
- [ ] A valid sample registration produces the existing feedback and browser-local membership state without retaining a password.
- [ ] The image change has not altered validation, `useForm`, EmailJS, or Firestore/local-storage behavior.

## Adopt

- [ ] Banner and guidance remain readable in both layouts and themes.
- [ ] Non-members see the existing membership check; registered sample members can continue.
- [ ] Selected pet, validation, saved draft, review step, and confirmation still work.
- [ ] A valid controlled enquiry preserves the existing local-storage/Firestore and EmailJS behavior; verify actual email delivery separately only when configured.

## Release

- [ ] Banner and guidance crop/stack correctly without moving the form while images load.
- [ ] Required fields, Singapore phone validation, and optional photo upload retain their existing behavior.
- [ ] A valid sample request reaches the existing confirmation and storage/email flow; no false delivery claim appears when EmailJS is unconfigured.

## Contact

- [ ] Banner, contact information, guidance, and location content remain readable and usable.
- [ ] Empty/invalid submission errors and valid sample submission feedback work as before.
- [ ] Existing service behavior is unchanged; use a controlled recipient for any configured EmailJS delivery check.

## Credits

- [ ] The introduction explains that photos come from free stock photo sites and are illustrative.
- [ ] Every catalogue entry appears in the appropriate section with thumbnail, filename, photographer, source, URL information, and licence.
- [ ] Unknown values show **TO BE CONFIRMED** and a visible **Credits being confirmed** note; no invented attribution or licence is presented as verified.
- [ ] Any attribution inferred from the filename is clearly marked **from filename**.
- [ ] Confirmed source URLs work. Unknown URL values are shown as text, not as invented or broken hyperlinks.
- [ ] Inspect the visible label on `stories/story-01.jpg`; confirm the original source and permission or replace the photo without removing the label.
- [ ] Reused photos are not credited as different photographers or represented as distinct real Pet Heaven animals/staff.

## Shared image, accessibility, and performance checks

- [ ] Primary photos use local `/images/` paths and meaningful alt text describing the actual photo.
- [ ] Images reserve space with width/height attributes and fixed aspect ratios; `object-fit: cover` crops rather than distorts.
- [ ] Everything except the Home hero uses lazy loading; the hero uses high fetch priority.
- [ ] Block a local photo request in browser developer tools, then reload: the shared image component shows a local illustration without repeated error loops or layout shift. Restore normal loading afterwards.
- [ ] No horizontal overflow, unexpected layout shift, broken images, or new console errors/warnings occur while navigating and opening pet details.
- [ ] Navbar/dropdown/mobile-menu links, footer links, cards, tiles, and buttons still lead to real pages or sections.
- [ ] Keyboard focus remains visible, every page keeps one main heading, and controls remain operable without a mouse.

## Commands to run before deployment

- [ ] `npm run check:images` passes; if it fails, fix the missing path or incorrect filename rather than suppressing the check.
- [ ] `npm run build` passes.
- [ ] `npm test` passes, including image-path and fallback tests.
- [ ] Record the actual command results and checks completed; keep unfinished credit confirmations visible until verified.
