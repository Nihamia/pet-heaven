# Pet Heaven design upgrade: Steps 1–3

The existing Assignment3 React project was edited incrementally. Routes and services were retained, with new legal and image-credit pages added. These changes are saved locally; GitHub and Firebase require a separate push/deploy to publish them.

## Verification after each step

| Step | Production build | Integration tests |
| --- | --- | --- |
| 1 — Navbar and footer | Passed | 14 passed |
| 2 — Home page | Passed | 16 passed |
| 3 — Pets, banners, and local images | Passed | 26 passed |

All original ten user-journey scenarios remain covered. The navigation scenario was adapted to use the new About disclosure and Our Story link. Additional tests cover dropdown click/keyboard behavior, mobile menu closure, newsletter validation/storage, legal links, sponsor navigation, news disclosure, both HDB filter values, combined filtering/sorting/reset, all six page banners, the complete credits catalogue, pet gallery changes, and preselected member adoption.

A source-hash comparison confirmed that the three service files, useForm, validators, useLocalStorage, usePets, Modal, AdoptPage, and ReleasePage were not edited. Join and Contact received section anchors; form handlers were retained.

The browser review checked Home at 375/600/900/1200 pixels, plus all six banner pages at mobile width, without horizontal overflow. It verified dropdown Escape behavior, mobile submenu navigation/closure, HDB Yes results (13 sample pets), 4:3 pet-card crops, 61 generated credit cards, the shrinking sticky header, dark/light rendering, and native keyboard expansion of news details. No browser console errors were observed. React Router's existing version-7 migration warnings remain development notices.

## How to check each step manually

Run `npm.cmd run dev` from Assignment3 and open the printed local URL.

| Step | Manual checks |
| --- | --- |
| 1 | Open Adopt/Get Involved/About; use Tab, ArrowDown and Escape. Resize below 1200px, open the hamburger, expand a submenu, and follow a section link. Check the bright Join button, sticky shrink on scroll, topbar/contact/social links, footer columns, exact coursework disclaimer, Privacy/Terms/Credits routes, and blank/invalid/valid newsletter input. Newsletter interest is browser-only and does not send mail. |
| 2 | Scroll Home in order: hero → four action tiles → counters → four promises → four adoption steps and checklist → four featured pets → stories → three dated news cards → sponsor/items strip → release CTA. Hover/focus the tiles, expand a Read more control, use sponsor/adoption links, toggle dark mode, and enable reduced motion in the browser/OS to check animations. Sponsor information collects no payment. |
| 3 | On /pets combine HDB-friendly Yes/No with search, species and sort, then clear filters. Toggle favourites, reopen a profile, switch gallery images, and follow its adoption link after registering in the same browser. Check the six banners/breadcrumbs at /about, /pets, /join, /release, /adopt and /contact. Open /credits and follow the replacement guide to substitute and credit photographs. |

The requested `/components-demo` route was already absent before this upgrade; no route had to be removed.

## Images and sample information

All 61 image files are original, labelled SVG photo placeholders under public/images. No reference-site photos, logos, copy, or pet identities were imported. The source catalogue is `src/data/images.js`; /credits is generated from it. See [the complete filename, required-size and search-term table](image-replacement-guide.md) for every replacement image. Update the image path, alt text, photographer/source credit, sourceUrl and placeholder flag together when replacing an asset. For pet photos, update matching pets.json paths (and Firestore records if you use that optional dataset).

Each of the 18 bundled pet profiles now has an explicit sample `hdbFriendly` boolean. The labels are illustrative coursework data, not housing approvals. Existing remote pet records without this field remain visible under Any and show Not assessed; add the field to remote records to use Yes/No filtering for those pets.

No official telephone number or social accounts were supplied for this fictional society. Phone/email enquiry and social icons therefore lead to valid contact information on the site, rather than invented real accounts or telephone numbers.

## Layout references

Layout ideas only: [SOSD](https://www.sosd.org.sg/), [OSCAS](https://www.oscas.sg/), and [Causes for Animals](https://www.causesforanimals.com/). All new written content and placeholder artwork are original to this coursework concept.

## Complete file-change table

| File | Change | Reason |
| --- | --- | --- |
| [docs/design-upgrade-notes.md](../docs/design-upgrade-notes.md) | Recorded changes, verification and manual checks | Provide a reviewable handover at the end of Step 3 |
| [docs/image-replacement-guide.md](../docs/image-replacement-guide.md) | Added all 61 filenames, sizes and suggested photo search terms | Make later real-photo replacement and crediting practical |
| [public/images/banners/about-placeholder.svg](../public/images/banners/about-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/banners/adopt-placeholder.svg](../public/images/banners/adopt-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/banners/contact-placeholder.svg](../public/images/banners/contact-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/banners/join-placeholder.svg](../public/images/banners/join-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/banners/pets-placeholder.svg](../public/images/banners/pets-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/banners/release-placeholder.svg](../public/images/banners/release-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/facilities/play-enrichment-placeholder.svg](../public/images/facilities/play-enrichment-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/facilities/quiet-recovery-placeholder.svg](../public/images/facilities/quiet-recovery-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/facilities/shelter-placeholder.svg](../public/images/facilities/shelter-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/facilities/veterinary-care-placeholder.svg](../public/images/facilities/veterinary-care-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/hero/home-hero-placeholder.svg](../public/images/hero/home-hero-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/news/supplies-drive-placeholder.svg](../public/images/news/supplies-drive-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/news/volunteer-orientation-placeholder.svg](../public/images/news/volunteer-orientation-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/news/welcome-space-placeholder.svg](../public/images/news/welcome-space-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/archie-lifestyle-placeholder.svg](../public/images/pets/archie-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/archie-portrait-placeholder.svg](../public/images/pets/archie-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/bear-lifestyle-placeholder.svg](../public/images/pets/bear-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/bear-portrait-placeholder.svg](../public/images/pets/bear-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/bruno-lifestyle-placeholder.svg](../public/images/pets/bruno-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/bruno-portrait-placeholder.svg](../public/images/pets/bruno-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/bumi-lifestyle-placeholder.svg](../public/images/pets/bumi-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/bumi-portrait-placeholder.svg](../public/images/pets/bumi-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/chutney-lifestyle-placeholder.svg](../public/images/pets/chutney-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/chutney-portrait-placeholder.svg](../public/images/pets/chutney-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/kaya-lifestyle-placeholder.svg](../public/images/pets/kaya-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/kaya-portrait-placeholder.svg](../public/images/pets/kaya-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/luna-lifestyle-placeholder.svg](../public/images/pets/luna-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/luna-portrait-placeholder.svg](../public/images/pets/luna-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/milo-lifestyle-placeholder.svg](../public/images/pets/milo-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/milo-portrait-placeholder.svg](../public/images/pets/milo-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/miso-lifestyle-placeholder.svg](../public/images/pets/miso-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/miso-portrait-placeholder.svg](../public/images/pets/miso-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/mochi-lifestyle-placeholder.svg](../public/images/pets/mochi-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/mochi-portrait-placeholder.svg](../public/images/pets/mochi-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/nori-lifestyle-placeholder.svg](../public/images/pets/nori-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/nori-portrait-placeholder.svg](../public/images/pets/nori-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/ollie-lifestyle-placeholder.svg](../public/images/pets/ollie-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/ollie-portrait-placeholder.svg](../public/images/pets/ollie-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/pepper-lifestyle-placeholder.svg](../public/images/pets/pepper-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/pepper-portrait-placeholder.svg](../public/images/pets/pepper-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/poppy-lifestyle-placeholder.svg](../public/images/pets/poppy-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/poppy-portrait-placeholder.svg](../public/images/pets/poppy-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/saffron-lifestyle-placeholder.svg](../public/images/pets/saffron-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/saffron-portrait-placeholder.svg](../public/images/pets/saffron-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/simba-lifestyle-placeholder.svg](../public/images/pets/simba-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/simba-portrait-placeholder.svg](../public/images/pets/simba-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/tika-lifestyle-placeholder.svg](../public/images/pets/tika-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/tika-portrait-placeholder.svg](../public/images/pets/tika-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/tofu-lifestyle-placeholder.svg](../public/images/pets/tofu-lifestyle-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/pets/tofu-portrait-placeholder.svg](../public/images/pets/tofu-portrait-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/stories/first-walks-placeholder.svg](../public/images/stories/first-walks-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/stories/settled-at-home-placeholder.svg](../public/images/stories/settled-at-home-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/stories/sunny-window-placeholder.svg](../public/images/stories/sunny-window-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/team/adoption-coordinators-placeholder.svg](../public/images/team/adoption-coordinators-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/team/animal-care-placeholder.svg](../public/images/team/animal-care-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/team/foster-community-placeholder.svg](../public/images/team/foster-community-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/team/veterinary-partners-placeholder.svg](../public/images/team/veterinary-partners-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/tiles/adopt-placeholder.svg](../public/images/tiles/adopt-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/tiles/join-placeholder.svg](../public/images/tiles/join-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/tiles/release-placeholder.svg](../public/images/tiles/release-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [public/images/tiles/sponsor-placeholder.svg](../public/images/tiles/sponsor-placeholder.svg) | Added original labelled SVG photo placeholder | Use a local image with recorded dimensions, alt text and credit |
| [src/App.jsx](../src/App.jsx) | Added Privacy, Terms, and Credits routes/titles | Make all new footer destinations work within the SPA |
| [src/components/forms/FormPageShell.jsx](../src/components/forms/FormPageShell.jsx) | Extended the existing shell with route-based banners | Retain form handlers while sharing the new introduction |
| [src/components/home/ImageTile.jsx](../src/components/home/ImageTile.jsx) | Added reusable ImageTile component | Reuse existing Card/Badge primitives and preserve a consistent Home design |
| [src/components/home/NewsCard.jsx](../src/components/home/NewsCard.jsx) | Added reusable NewsCard component | Reuse existing Card/Badge primitives and preserve a consistent Home design |
| [src/components/home/StatCounter.jsx](../src/components/home/StatCounter.jsx) | Added reusable StatCounter component | Reuse existing Card/Badge primitives and preserve a consistent Home design |
| [src/components/home/StepCard.jsx](../src/components/home/StepCard.jsx) | Added reusable StepCard component | Reuse existing Card/Badge primitives and preserve a consistent Home design |
| [src/components/home/StoryCard.jsx](../src/components/home/StoryCard.jsx) | Added reusable StoryCard component | Reuse existing Card/Badge primitives and preserve a consistent Home design |
| [src/components/layout/Footer.jsx](../src/components/layout/Footer.jsx) | Added three link columns, validated local newsletter, contact/legal/credits links and disclaimer | Provide complete, honest site-wide information and useful links |
| [src/components/layout/Navbar.jsx](../src/components/layout/Navbar.jsx) | Added topbar, grouped disclosures, bright Join action and compact state | Offer a clear charity navigation hierarchy on desktop/mobile |
| [src/components/layout/ScrollToTop.jsx](../src/components/layout/ScrollToTop.jsx) | Added hash scrolling, reveal and destination focus | Keep section links usable with keyboard navigation |
| [src/components/layout/SocialLinks.jsx](../src/components/layout/SocialLinks.jsx) | Added reusable original SVG social icons with valid contact destinations | Share accessible icons without inventing charity accounts |
| [src/components/pets/PetCard.jsx](../src/components/pets/PetCard.jsx) | Added HDB facts, explicit image dimensions and catalogue alt text | Display housing information with stable image layout |
| [src/components/pets/PetDetailModal.jsx](../src/components/pets/PetDetailModal.jsx) | Added HDB fact, local image descriptions and dimensions | Keep gallery details consistent with pet cards |
| [src/components/pets/PetFilters.jsx](../src/components/pets/PetFilters.jsx) | Added HDB-friendly Any/Yes/No selection | Support the new explicit pet-data flag |
| [src/components/ui/Breadcrumb.jsx](../src/components/ui/Breadcrumb.jsx) | Added a reusable semantic breadcrumb trail | Provide page context and a working route home |
| [src/components/ui/Dropdown.jsx](../src/components/ui/Dropdown.jsx) | Added a controlled keyboard-friendly disclosure | Reuse desktop dropdown/mobile accordion behavior |
| [src/components/ui/PageBanner.jsx](../src/components/ui/PageBanner.jsx) | Added a reusable local image/title/breadcrumb banner | Keep six page introductions consistent |
| [src/data/images.js](../src/data/images.js) | Added the complete 61-image metadata catalogue | Centralise local paths, alt text, dimensions and honest credits |
| [src/data/pets.json](../src/data/pets.json) | Added 18 sample HDB flags and local portrait/gallery paths | Drive filters and remove remote sample-image dependencies |
| [src/hooks/useScrollReveal.js](../src/hooks/useScrollReveal.js) | Added progressive section reveal with reduced-motion fallback | Add subtle motion without hiding keyboard-focused content |
| [src/main.jsx](../src/main.jsx) | Imported the image stylesheet | Apply consistent catalogue and About image styling |
| [src/pages/AboutPage.jsx](../src/pages/AboutPage.jsx) | Added banner and facility/team placeholders | Make information sections visually consistent with the new Home page |
| [src/pages/ContactPage.jsx](../src/pages/ContactPage.jsx) | Added contact/social anchors and honest account information | Give topbar/footer icons useful destinations |
| [src/pages/CreditsPage.jsx](../src/pages/CreditsPage.jsx) | Generated category cards from the shared image catalogue | Keep every image attribution visible and maintainable |
| [src/pages/HomePage.jsx](../src/pages/HomePage.jsx) | Upgraded existing sections in the requested order with original content | Create a richer charity landing page without replacing data/favourite logic |
| [src/pages/JoinPage.jsx](../src/pages/JoinPage.jsx) | Added a support-interests section anchor | Give Volunteer and support links a real destination |
| [src/pages/PetsPage.jsx](../src/pages/PetsPage.jsx) | Added banner, HDB filtering and remote-data memo dependency | Preserve search/sort/gallery behavior while adding the new filter |
| [src/pages/PrivacyPage.jsx](../src/pages/PrivacyPage.jsx) | Added original static coursework privacy information | Explain browser storage and optional connected form services |
| [src/pages/TermsPage.jsx](../src/pages/TermsPage.jsx) | Added original static coursework terms | Explain illustrative content and non-payment support flows |
| [src/styles/home-about.css](../src/styles/home-about.css) | Extended scoped Home grids, image overlays, hover and reveal styles | Implement the requested Home design while retaining About styles |
| [src/styles/images.css](../src/styles/images.css) | Added responsive credit catalogue and About photo styles | Give local placeholders predictable crops and sizes |
| [src/styles/layout.css](../src/styles/layout.css) | Extended header/footer/disclosure/banner/breadcrumb styles | Keep spacing, accessibility and responsive behavior consistent |
| [src/styles/pets.css](../src/styles/pets.css) | Extended card facts, banner spacing and responsive image sizing | Support four facts and preserve 4:3 crops without layout shift |
| [src/tests/app.integration.test.jsx](../src/tests/app.integration.test.jsx) | Updated existing About navigation to the new disclosure | Retain the original route-navigation scenario |
| [src/tests/design.integration.test.jsx](../src/tests/design.integration.test.jsx) | Added 16 integration test cases | Check new UI behavior and preserved detail/adoption flow |
