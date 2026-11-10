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

Describe the public pages for the society, pet gallery and enquiries, plus Get Involved (`/get-involved`), Join (`/join`), Login (`/login`), Forgot Password (`/forgot-password`), and the protected Member (`/member`) and Adopt (`/adopt`) routes. Explain how shared navigation, route-aware page titles and scroll behavior support these journeys.

### 2.2 Page layout and user journeys

Summarise the main decisions on each page:

- **Home:** mission-led hero, clear calls to action, impact figures, adoption steps, featured pets, and support prompts.
- **About:** purpose, facilities, adoption guidance, eligibility information, team roles, FAQs, and visit information.
- **Pets:** search, filters, sorting, result count, cards, favourites, recently viewed pets, and a detail view that leads into adoption.
- **Get Involved and Join** show role information, validated account registration and conditional role questions.
- **Member** shows the membership card, support resources, editable details and adoption request history.
- **Adopt** requires sign-in, prefills contact details, and offers household questions, interview preferences and a review step.
- **Release:** non-judgemental introduction, owner and pet details, validation, and a support-request flow.
- **Contact:** validated message form and society contact information.

Insert screenshots of the pages and interactions you demonstrate. Include the sign-in return from a pet profile, the prefilled adoption form and the member request list.

### 2.3 Visual design and accessibility

Explain how the warm teal, orange, cream, and dark palette supports a friendly charity identity. Discuss the Poppins/Nunito typography, rounded cards, generous spacing, mobile-first responsive layout, focus states, labels, inline errors, image alternative text, and dark-mode option. Include a mobile screenshot as well as a desktop screenshot.

## 3. Component-based implementation

Describe how shared components reduce repeated markup and keep behavior consistent. Examples include `Button`, `Card`, `Badge`, `Alert`, `Modal`, `Accordion`, `SectionHeading`, and `FormField`; pet-specific pieces include `PetCard`, `SearchBar`, `PetFilters`, `FavouriteButton`, and `PetDetailModal`. Mention shared hooks for forms, pet loading, and browser storage, plus shared validation helpers.

Add one small example from the source code or a diagram showing a page composed from reusable components. Explain what you learned about component-based design.

## 4. Data, validation, and email

Explain the data flow accurately for the submitted configuration:

- Pet profiles are bundled in `src/data/pets.json` and remain available when Firebase is not configured or has no usable profiles.
- Favourites, drafts and fallback form records stay in the visitor's browser.
- Firebase Authentication handles account creation, sign-in and password reset. Firestore uses the account UID for profiles and adoption requests, so signed-in members can use them across devices.
- The rules allow public pet reads and validated Release and Contact creates. Each member can read their own profile and adoption requests and update selected profile fields.
- EmailJS sends the administrator notification and applicant acknowledgement when configured. Describe the delivery checks you performed.
- Validation covers required fields, email, Singapore phone format, password rules, age confirmation, date selection, and relevant length/file constraints.

Explain that Firebase Authentication handles passwords and that Firestore profiles and form emails contain only the relevant account and enquiry details.

## 5. Testing and quality checks

Record the checks you ran and their results. Include the gallery and public forms, registration and login, signed-out route redirects, adoption prefill and My Requests.

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
- Verify cross-device sign-in, profile changes and requests on the deployed build.
- Configure and verify EmailJS delivery with the intended administrator template and recipient.
- Gather feedback from users and check the site on additional browsers, screen sizes, and assistive technologies.

## 8. Reflection and conclusion

Reflect on the most important design and coding decisions, what you learned about React components and SPA navigation, and how testing changed or confirmed the implementation. End with a short summary of how the application supports the Pet Heaven scenarios and what would be needed before real-world use.
