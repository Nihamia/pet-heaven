# Stock-photo wiring review

All stock subjects are illustrative. Breed/type and size labels are visual approximations, not verified animal records. Species counts remain nine dogs and nine cats. Ages, gender, health, HDB flags, availability and behaviour data were not inferred from the photographs.

## Profile appearance changes

| Pet | Local photo filename | Previous breed; size; colour | Photo-aligned breed/type; size; colour |
| --- | --- | --- | --- |
| Milo | pet-02-dog-mixed.jpg | Singapore Special; Medium; Tan and white | Golden Retriever type; Large; Golden |
| Miso | pet-17-cat-calico.jpg | Domestic Shorthair; Small; Calico | Domestic Shorthair; Small; Calico |
| Kaya | pet-05-dog-puppy.jpg | Singapore Special mix; Small; Brown and cream | Retriever-type puppy; Small; Pale golden |
| Nori | pet-13-cat-black.jpg | Domestic Shorthair; Small; Black and white | Domestic Shorthair; Small; Black |
| Bruno | pet-03-dog-brown.jpg | Labrador mix; Large; Chocolate brown | Mastiff-type mix; Large; Tan with a dark muzzle |
| Luna | pet-16-cat-grey.jpg | Domestic Longhair; Medium; Silver and white | Domestic Shorthair; Medium; Grey |
| Bumi | pet-06-dog-senior.jpg | Singapore Special; Large; Brindle | Long-haired mixed breed; Medium; Black with a grey muzzle |
| Pepper | pet-11-cat-tabby.jpg | Domestic Shorthair; Small; Tortoiseshell | Domestic Shorthair; Small; Brown and black tabby |
| Archie | pet-08-dog-spotted.webp | Shih Tzu mix; Small; Cream and grey | Beagle-type dog; Medium; White, tan and black |
| Saffron | pet-14-cat-orange.jpg | Persian mix; Small; Cream | Domestic Shorthair; Small; Ginger tabby |
| Tofu | pet-04-dog-small.jpg | Jack Russell mix; Small; White and tan | Small spitz-type dog; Small; White |
| Chutney | pet-15-cat-kitten.jpg | Domestic Shorthair; Small; Ginger and white | Domestic Mediumhair; Small; Brown tabby and white |
| Bear | pet-07-dog-black.jpg | Singapore Special; Large; Black with white chest | Labrador-type dog; Large; Black |
| Poppy | pet-12-cat-white.jpg | Domestic Mediumhair; Small; Calico | Domestic Shorthair; Small; White |
| Ollie | pet-10-dog-terrier.jpg | Poodle mix; Small; Apricot | West Highland Terrier type; Small; White |
| Tika | pet-18-cat-senior.jpg | Domestic Shorthair; Small; Grey and white | Domestic Longhair; Medium; Grey-brown tabby and white |
| Simba | pet-09-dog-husky.jpg | Corgi mix; Small; Golden and white | Husky-type dog; Large; Black and white |
| Mochi | pet-14-cat-orange.jpg | Domestic Shorthair; Medium; Orange and white | Domestic Shorthair; Medium; Ginger tabby |

## Photos to replace or confirm

- Saffron and Mochi share pet-14-cat-orange.jpg because only eight cat photos were provided for nine cat profiles. Supply one more cat photo for distinct identities.
- Kaya’s photo shows two puppies. Supply a single-puppy portrait if you want an unambiguous individual profile.
- Chutney’s photo depicts a kitten and may look younger than the fictional one-year profile. Exact ages cannot be established from stock photos.
- Each pet has one unique gallery photo. Additional angles can be added later; no different animal is presented as a second angle of the same pet.
- pet-01-dog-golden.jpg is an additional stock photo listed in Credits, not assigned to a pet profile.
- team-volunteer-lead.jpg is reused for the animal-care and foster-community role cards. These are illustrative stock people, not identified society staff.
- facility-vet.jpg visibly contains an iStock/source credit label; story-01.jpg visibly contains a photography-studio label. Neither label was removed or retouched. Confirm the original source and rights or replace these files.
- banner-adopt.jpg is 580 × 581 pixels. It is wired as supplied, but a wider replacement is recommended for a crisp banner.
- Eighteen supplied files exceed 300 KB. Original bytes are preserved; compression/conversion was not included in the approved rename map.
- No photographer, source URL or licence has been invented. All four stock credit fields remain TO BE CONFIRMED until you have source records.

## Approved path changes

| Previous path under public/images | Applied path |
| --- | --- |
| hero/home-hero.jpeg | hero/home-hero.jpg |
| facilities/facility-shelter.jpeg | facilities/facility-shelter.jpg |
| tiles/tile.sponsor.jpg | tiles/tile-sponsor.jpg |
| facilities/story-01.jpg | stories/story-01.jpg |
| facilities/story-02.jpg | stories/story-02.jpg |
| facilities/story-03.jpg | stories/story-03.jpg |

## Additional age check

Tika uses pet-18-cat-senior.jpg while the fictional profile remains 3.2 years old. The filename suggests an older cat; the actual age cannot be verified visually. Replace it if you want the supplied age label and profile age to agree.

## Completed verification

- npm run check:images: passed; all 43 unique referenced local files exist.
- npm run build: passed after the final card/thumbnail sizing fix.
- npm test: 75 tests passed across five files, including nine new image tests; API and email requests were mocked.
- Browser layout checks: Home, Pets, About, Join, Adopt, Release, Contact and Credits at 1200 × 900 and 375 × 812, in light and dark themes (32 views). Each had one main h1 and no horizontal overflow. No browser errors or warnings were captured.
- Browser pet check: Cat + HDB-friendly + name sorting returned nine profiles; Miso detail photo loaded, its thumbnail measured 80 × 60 pixels, and the main photo stayed 4:3.
- Browser About check: all four facilities used the new local photos at 4:3; four team cards retained.
- All 103 original image files retain identical bytes after the six approved path changes. No compression, watermark removal or image retouching was performed.
- Hash checks confirmed 24 protected form, hook, validator, route, filter, service and palette files unchanged.
- No live email submissions, GitHub push or Firebase deployment was performed.

## Exact files changed

Paths below are relative to the existing Assignment3 project. There are 24 code/test/documentation files changed or added, plus six image-path renames. Production dist output was regenerated by the build.

| File | Change | Reason |
| --- | --- | --- |
| src/data/images.js | Updated existing descriptors to real files, actual sizes, descriptive alt text and structured pending credits; deduplicated 43 credit entries. | Central image metadata and honest attribution. |
| src/data/pets.json | Updated portraits/galleries and photo-aligned breed/type, size and colour. | Match real photo appearances while retaining all 18 profiles and IDs. |
| src/components/ui/FallbackImage.jsx | Added reusable lazy image with local fallback and source-change recovery. | Handle missing or failed files without loops. |
| src/components/ui/PageBanner.jsx | Uses shared fallback, native dimensions and lazy loading. | Consistent inner-page images. |
| src/components/home/ImageTile.jsx | Uses shared fallback and focal position. | Safe action-tile photographs. |
| src/components/home/StoryCard.jsx | Uses shared fallback and focal position. | Safe story photographs. |
| src/components/home/NewsCard.jsx | Uses shared fallback and focal position. | Safe news photographs. |
| src/components/home/RandomPetPhoto.jsx | Uses shared fallback and truthful local-photo credit wording. | Preserve optional API behaviour after local fallbacks became stock photos. |
| src/components/pets/PetCard.jsx | Uses actual descriptor sizes, alt text, focal position and fallback. | Stable real-photo pet cards. |
| src/components/pets/PetDetailModal.jsx | Uses actual image metadata and lazy fallbacks for main image and thumbnails. | Keep details and gallery working. |
| src/pages/HomePage.jsx | Wired hero through shared image, eager/high priority; stock note and neutral story wording. | Prioritise hero and avoid implying stock photos identify named profiles. |
| src/pages/AboutPage.jsx | Wired facility/team photos and labelled them as illustrative stock. | Use the supplied photos without inventing society identities. |
| src/pages/CreditsPage.jsx | Grouped thumbnails, paths, filenames, structured credits and pending notices. | Show every catalogued file and unconfirmed attribution. |
| src/styles/images.css | Styled pending-credit notes and wrapped long metadata. | Readable credits in both themes and narrow layouts. |
| src/styles/pets.css | Made card content flex correctly and fixed thumbnail aspect/height. | Prevent oversized native image dimensions stretching gallery thumbnails. |
| scripts/check-images.mjs | Added read-only CLI/reference checker with nonzero failure for missing or escaping paths. | Catch broken image paths before deployment. |
| package.json | Added check:images command. | Make image validation easy to run. |
| src/tests/images.integration.test.jsx | Added nine image, credit, fallback and gallery cases. | Verify actual files and new image behaviour. |
| src/tests/design.integration.test.jsx | Adapted product gallery check to one supplied photo; kept adoption preselection. | Match actual photo availability without dropping gallery coverage. |
| src/tests/random-pet-photo.test.jsx | Updated local-photo error/credit copy assertions. | Keep API/timer tests aligned with real local fallbacks. |
| README.md | Documented stock images, credits, fallback and check command. | Keep project instructions current. |
| docs/image-replacement-guide.md | Updated workflow and actual 42-photo inventory. | Guide later photo and credit replacements. |
| docs/photo-wiring-checklist.md | Added all-eight-page desktop/mobile and light/dark manual checks. | Support verification after future edits or deployment. |
| docs/stock-photo-review.md | Recorded profile mapping, limitations, verification and exact change table. | Make substitutions and validation reviewable. |
| public/images/hero/home-hero.jpeg → public/images/hero/home-hero.jpg | Approved filename rename; original bytes unchanged. | Standardise JPEG filename extension. |
| public/images/facilities/facility-shelter.jpeg → public/images/facilities/facility-shelter.jpg | Approved filename rename; original bytes unchanged. | Standardise JPEG filename extension. |
| public/images/tiles/tile.sponsor.jpg → public/images/tiles/tile-sponsor.jpg | Approved filename rename; original bytes unchanged. | Use a hyphenated filename. |
| public/images/facilities/story-01.jpg → public/images/stories/story-01.jpg | Approved move; original bytes unchanged. | Use the intended story folder. |
| public/images/facilities/story-02.jpg → public/images/stories/story-02.jpg | Approved move; original bytes unchanged. | Use the intended story folder. |
| public/images/facilities/story-03.jpg → public/images/stories/story-03.jpg | Approved move; original bytes unchanged. | Use the intended story folder. |
