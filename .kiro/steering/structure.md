---
inclusion: always
---

# Project structure

| Path | Responsibility |
| --- | --- |
| src/App.jsx, src/main.jsx | Route tree, providers, browser entry, stylesheet imports |
| src/pages/ | Route-level pages named *Page.jsx |
| src/components/layout/ | Navbar, Footer, Layout, Brand, ThemeToggle, social and scroll controls |
| src/components/ui/ | Button, Card, Badge, Alert, Modal, Toast, Spinner, Skeleton, Accordion, Dropdown, PageBanner, Breadcrumb, SectionHeading, FallbackImage |
| src/components/forms/ | FormField, FormPageShell, FormGuide, RoleCard, SubmissionFeedback, SubmissionHoneypot |
| src/components/pets/ | PetCard, PetDetailModal, PetFilters, SearchBar, FavouriteButton, AddPetModal |
| src/components/home/ | ImageTile, StepCard, StatCounter, StoryCard, NewsCard, RandomPetPhoto |
| src/components/admin/ | AdminLayout, AdminOverview, AdminSubmissions, AdminPets, DetailPanel, DataTable, FilterBar, StatCard, StatusBadge, EmptyState, QuickActions, AvailabilityControl |
| src/components/auth/, src/context/ | ProtectedRoute, AdminRoute, member/staff auth and workflow context |
| src/hooks/ | useForm, useAdminSubmission, usePets, useLocalStorage, useScrollReveal |
| src/services/ | Firebase, Auth, members, submissions, staff workflow, pets, references, EmailJS |
| src/utils/ | Validators, dates and form helpers, pet helpers, CSV and image processing |
| src/data/ | pets.json, images.js, roles.js, staffPetFields.js, adminDashboard.js, adminWorkflow.js |
| src/styles/ | Plain CSS by feature, shared tokens in variables.css |
| src/tests/ | *.test.js and *.integration.test.jsx, setup.js, accountMocks.js |
| public/images/, scripts/ | Local credited images and image-path checker |
| docs/ | Handoff, report outline, recording script, deployment and checklists |
| firebase.json, firestore.rules, .env.example | Deploy paths, data access, environment variable names |

Use PascalCase for components, camelCase for hooks and services, and keep validation and data access out of presentational components. Prefer existing shared components, explicit accessible labels, semantic HTML, and the existing CSS tokens.

## Spec generation rules

- One spec per feature. Keep specs minimal.
- At most five acceptance criteria per requirement.
- No diagrams or test plans in generated specs.
