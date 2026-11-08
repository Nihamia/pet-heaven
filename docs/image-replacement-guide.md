# Pet Heaven image replacement guide

The site now uses 42 locally supplied stock photos. Individual photographers, source pages and licences are TO BE CONFIRMED in src/data/images.js; /credits shows that state visibly. The 61 original SVG files are retained, with the original hero SVG used as the shared fallback. Only files used or catalogued for stock-photo credits appear in imageCredits.

## Replace or add a photo

1. Save the photo locally using a lowercase, hyphenated filename. Keep the true file-format extension.
2. Record its actual path, descriptive alt text, native width/height and credit object (photographer, source, url, licence) in src/data/images.js. Unknown fields stay TO BE CONFIRMED. If attribution comes only from a filename, explicitly mark its origin as from filename; do not invent an image-page URL or licence.
3. Update the matching image and gallery entries in src/data/pets.json. Add a second angle only when it represents the same intended animal; do not duplicate gallery entries merely to fill space.
4. Check the 4:3 pet/facility/tile crop, 16:10 story/news crop, square team crop, and responsive hero/banner crop at desktop and mobile widths. Use objectPosition to protect the subject when necessary.
5. Run npm run check:images, npm run build and npm test. Follow docs/photo-wiring-checklist.md and see docs/stock-photo-review.md for known substitutions and appearance changes.

## Current local photo files

| Path under public/images | Actual pixels | KB |
| --- | --- | --- |
| banners/banner-about.jpg | 1024 × 768 | 176.3 |
| banners/banner-adopt.jpg | 580 × 581 | 66.5 |
| banners/banner-contact.jpg | 800 × 400 | 34.6 |
| banners/banner-join.avif | 626 × 417 | 35.7 |
| banners/banner-pets.avif | 2000 × 1125 | 180.1 |
| banners/banner-release.jpg | 2137 × 1403 | 343.2 |
| facilities/facility-play-area.jpg | 869 × 581 | 131.1 |
| facilities/facility-quarantine.jpg | 1728 × 1152 | 333.4 |
| facilities/facility-shelter.jpg | 1600 × 900 | 1766.9 |
| facilities/facility-vet.jpg | 1024 × 682 | 89.0 |
| hero/home-hero.jpg | 1249 × 700 | 75.9 |
| news/news-01-food-drive.jpg | 1263 × 831 | 237.5 |
| news/news-02-foster.jpg | 3024 × 4032 | 828.2 |
| news/news-03-event.png | 1622 × 902 | 2490.6 |
| pets/pet-01-dog-golden.jpg | 1440 × 1920 | 505.8 |
| pets/pet-02-dog-mixed.jpg | 819 × 1023 | 141.8 |
| pets/pet-03-dog-brown.jpg | 3657 × 2438 | 669.0 |
| pets/pet-04-dog-small.jpg | 3000 × 1500 | 324.2 |
| pets/pet-05-dog-puppy.jpg | 1920 × 1080 | 209.4 |
| pets/pet-06-dog-senior.jpg | 1000 × 656 | 93.5 |
| pets/pet-07-dog-black.jpg | 3888 × 2592 | 1611.9 |
| pets/pet-08-dog-spotted.webp | 1024 × 680 | 83.1 |
| pets/pet-09-dog-husky.jpg | 1220 × 599 | 47.3 |
| pets/pet-10-dog-terrier.jpg | 2116 × 1416 | 271.7 |
| pets/pet-11-cat-tabby.jpg | 3840 × 5213 | 1328.7 |
| pets/pet-12-cat-white.jpg | 1999 × 1459 | 203.3 |
| pets/pet-13-cat-black.jpg | 4000 × 2700 | 669.5 |
| pets/pet-14-cat-orange.jpg | 918 × 1200 | 105.3 |
| pets/pet-15-cat-kitten.jpg | 3840 × 2160 | 1913.3 |
| pets/pet-16-cat-grey.jpg | 4073 × 2705 | 1725.0 |
| pets/pet-17-cat-calico.jpg | 1280 × 1024 | 316.0 |
| pets/pet-18-cat-senior.jpg | 2560 × 1390 | 524.8 |
| stories/story-01.jpg | 1255 × 837 | 169.0 |
| stories/story-02.jpg | 2940 × 1960 | 451.6 |
| stories/story-03.jpg | 626 × 470 | 53.9 |
| team/team-director.png | 747 × 445 | 394.9 |
| team/team-vet.jpg | 612 × 406 | 32.9 |
| team/team-volunteer-lead.jpg | 612 × 408 | 47.7 |
| tiles/tile-adopt.jpg | 1024 × 802 | 68.1 |
| tiles/tile-join.jpg | 1400 × 950 | 275.7 |
| tiles/tile-release.jpg | 2000 × 1333 | 431.7 |
| tiles/tile-sponsor.jpg | 720 × 610 | 78.9 |
