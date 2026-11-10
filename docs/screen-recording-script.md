# Pet Heaven — six-minute narrated walkthrough

**Target length:** about 6 minutes at a clear, conversational pace. Bracketed directions are screen actions, not narration. Use sample data for the walkthrough. If EmailJS is configured, use a controlled test template and recipient so the recording does not send test enquiries to the society administrator.

## 0:00–0:30 — Introduction

[Show the Home page at the top.]

“Hello, this is my Pet Heaven website for the ISIT207 assignment. Pet Heaven is a concept for a Singapore charity that cares for abandoned cats and dogs. The site is designed to help visitors learn about the society, meet pets that are available for adoption, become supporters, and send adoption, release, or contact enquiries. I built it as a React single-page application with reusable components and a responsive layout.”

## 0:30–1:15 — Home page

[Point to the main buttons, scroll through the impact strip, adoption steps, and featured pets.]

“The Home page introduces the mission and gives visitors two clear next steps: browse the pets or join the community. Below the hero, the impact strip and three-step adoption explanation make the process easy to scan. The featured pet cards provide another route into the gallery. The figures and stories shown here are sample project content, not verified statistics for a real organisation.”

## 1:15–1:55 — About page

[Use the navigation to open About. Show the facilities, adoption guidance, and FAQ accordion.]

“The About page explains the society’s purpose and care approach. I separated the information into sections for the story, facilities, adoption preparation, team roles, and frequently asked questions. The FAQ accordion keeps answers available without making the page feel too long. The visit details are also marked as sample information, so they should be replaced with verified details before the site represents a real shelter.”

## 1:55–3:00 — Pet gallery

[Open Adopt a Pet. Search for “Milo,” clear the search, choose a species, then open a pet profile. Toggle a favourite.]

“The gallery helps visitors narrow the list using a debounced name or breed search, species and other filters, and sorting. The result count updates with the selected criteria, and an empty-state message appears when there are no matches. I can open a profile to read more about the pet, then save a favourite. Favourites and recently viewed pets are kept in browser storage, so they persist in this browser but do not synchronise to another device. The sample profiles come from the bundled JSON file unless Firestore is configured with pet records.”

## 3:00–3:55 — Join Us

[Open Join Us. Submit the empty form to show validation, then enter test details, select an interest and age confirmation, and submit. Pause on the generated member ID.]

“The Join page creates a Firebase account and asks how the member would like to help. The volunteer, foster and donor cards reveal the questions for each role. After a valid registration, the membership page shows the member ID, roles and join date. Firebase handles the password, and EmailJS sends the administrator notification and applicant acknowledgement.”

## 3:55–4:50 — Adoption enquiry

[Open a pet's profile and follow its adoption link. Show the applicant fields and preselected pet. Scroll through the application fields and review step before sending.]

“Adopt requires a signed-in member. The enquiry starts with the member’s name, account email and phone number. The applicant describes their household, housing, care experience and schedule, then chooses a preferred interview time. The review step lets them check their answers before submitting. The member can find the enquiry again in My Requests.”

## 4:50–5:30 — Release and contact

[Open Release a Pet. Show the owner and pet detail sections and a phone validation message with a test value. Then open Contact and show the message form and contact details.]

“The release page uses a supportive tone and gathers information about the owner and pet, along with the reason and preferred handover details. It validates Singapore phone numbers before accepting a request. The Contact page provides a separate route for general questions. Valid submissions show feedback and are saved locally in the demo; Firestore and EmailJS can be connected through environment settings.”

## 5:30–6:00 — Design, testing, and close

[Show the theme toggle, briefly resize or show a mobile viewport, then finish on Home.]

“Across the site, I used shared buttons, cards, alerts, form fields, and pet components to keep the interface consistent. The layout adapts to smaller screens and includes visible labels, focus styles, and a dark-mode option. I added 10 integration tests for the main journeys, including navigation, filtering, form validation, favourites, and the membership check. Firebase Hosting is configured, but the app is not deployed until a Firebase project is selected and the deployment command is run. Thank you for watching my Pet Heaven walkthrough.”
