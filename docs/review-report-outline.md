# Pet Heaven review report — draft outline

Use this as a planning draft for the assignment report. Replace bracketed prompts with your own verified details, screenshots, and reflections before submission. The site currently contains sample organisation information and sample statistics; describe those as design assumptions unless you replace them with verified facts.

## Cover page

- **Assignment:** ISIT207 Frontend Web Programming — Assignment 3
- **Application:** Pet Heaven
- **Student:** [Name and student number]
- **Submission date:** [Date]
- **Deployed website:** [Public URL, after deployment]
- **Walkthrough video:** [Google Drive link with viewer access]

## 1. Introduction and purpose

Briefly introduce Pet Heaven as a concept for a Singapore charity that cares for abandoned cats and dogs. Explain that the application is intended to communicate the society's purpose and pet information, and to let visitors register as supporters or submit adoption, release, and general contact enquiries.

Suggested points to address:

- The problem the website is designed to help with.
- Its main audiences: prospective adopters, current or prospective supporters, and owners seeking help with a pet.
- The required user journeys represented in the application.

## 2. Design decisions

### 2.1 Site structure and navigation

Describe the React single-page application and its routes: Home (`/`), About (`/about`), Pets (`/pets` and `/pets/:id`), Join (`/join`), Adopt (`/adopt`), Release (`/release`), Contact (`/contact`), and a not-found route. Explain why the shared navigation, footer, route-aware page titles, and scroll-to-top behavior make the site easier to use.

### 2.2 Page layout and user journeys

Summarise the main decisions on each page:

- **Home:** mission-led hero, clear calls to action, impact figures, adoption steps, featured pets, and support prompts.
- **About:** purpose, facilities, adoption guidance, eligibility information, team roles, FAQs, and visit information.
- **Pets:** search, filters, sorting, result count, cards, favourites, recently viewed pets, and a detail view that leads into adoption.
- **Join:** membership benefits, validated registration, support interests, and a generated member reference.
- **Adopt:** same-browser member check, pet and household questions, commitments, preferred interview time, and review step.
- **Release:** non-judgemental introduction, owner and pet details, validation, and a support-request flow.
- **Contact:** validated message form and society contact information.

Insert screenshots of the pages and interactions you actually demonstrate. Suggested captions: “Home page and primary actions,” “Pet search and filters,” “Pet profile and favourite action,” “Form validation,” and “Adoption membership check.”

### 2.3 Visual design and accessibility

Explain how the warm teal, orange, cream, and dark palette supports a friendly charity identity. Discuss the Poppins/Nunito typography, rounded cards, generous spacing, mobile-first responsive layout, focus states, labels, inline errors, image alternative text, and dark-mode option. Include a mobile screenshot as well as a desktop screenshot.

## 3. Component-based implementation

Describe how shared components reduce repeated markup and keep behavior consistent. Examples include `Button`, `Card`, `Badge`, `Alert`, `Modal`, `Accordion`, `SectionHeading`, and `FormField`; pet-specific pieces include `PetCard`, `SearchBar`, `PetFilters`, `FavouriteButton`, and `PetDetailModal`. Mention shared hooks for forms, pet loading, and browser storage, plus shared validation helpers.

Add one small example from the source code or a diagram showing a page composed from reusable components. Explain what you learned about component-based design.

## 4. Data, validation, and email

Explain the data flow accurately for the submitted configuration:

- Pet profiles are bundled in `src/data/pets.json` and remain available when Firebase is not configured or has no usable profiles.
- Favourites, drafts, and fallback form records are saved in the visitor's browser. This supports a demo but does not synchronise data across browsers or devices.
- When configured, Firestore can provide pet profiles and save member, adoption, release, and contact records. State whether you configured and tested it; do not imply it is active if you did not.
- The Firestore rules allow pet-profile reads and validated form creates, while blocking client reads of member and request records. Explain that these student-project rules do not replace a full production security review.
- EmailJS sends administrator notifications only when its service, template, and public-key values are configured. State how you tested email delivery, or clearly say that live email delivery was not configured.
- Validation covers required fields, email, Singapore phone format, password rules, age confirmation, date selection, and relevant length/file constraints.

Mention that passwords are not included in saved member records. Explain that membership verification in this demo uses the current browser's saved registration and is not secure account authentication.

## 5. Testing and quality checks

Record the checks you actually ran and their results. The project includes 10 Vitest and React Testing Library integration tests for navigation, pet search, species filtering, empty results, favourite persistence, join validation and success, password exclusion from saved records, blocked non-member adoption, release phone validation, and contact submission.

The tests mock Firebase and EmailJS, so they verify the local user journeys without sending email or writing to a live database. Add the test date and any manual browser checks you completed. Do not claim tests or device checks that you did not run.

## 6. Deployment

- **Platform:** [Firebase Hosting or another platform]
- **Website URL:** [Public URL]
- **Deployment date:** [Date]
- **Routes tested after deployment:** [List routes and direct-refresh checks]
- **Firebase usage:** [Hosting only / Hosting plus Firestore / another setup]

The Firebase configuration publishes the Vite `dist` folder and rewrites app routes to `/index.html` for BrowserRouter. Add a screenshot of the deployed site and note whether the forms, images, and direct links worked after deployment. Deployment is separate from local development; the presence of `firebase.json` does not mean the site has already been published.

## 7. Limitations and future improvements

Discuss relevant limitations and realistic next steps:

- Replace sample statistics, stories, addresses, opening hours, and pet information with verified society data.
- Replace sample photos with suitable credited images.
- Add authenticated staff tools for maintaining pet records and reviewing enquiries.
- Use a secure backend and stronger privacy/access controls before handling real personal data.
- Verify cross-device membership and saved-form behavior if a backend is added.
- Configure and verify EmailJS delivery with the intended administrator template and recipient.
- Gather feedback from users and check the site on additional browsers, screen sizes, and assistive technologies.

## 8. Reflection and conclusion

Reflect on the most important design and coding decisions, what you learned about React components and SPA navigation, and how testing changed or confirmed the implementation. End with a short summary of how the application supports the Pet Heaven scenarios and what would be needed before real-world use.
