---
inclusion: always
---

# Project structure

```text
Assignment3/
  src/
    App.jsx, main.jsx       Routes, providers, browser entry and CSS imports
    pages/                 Route-level *Page.jsx components
    components/
      layout/              Shell, navigation, footer and theme
      ui/                  Shared primitives and banners
      forms/               Fields, role cards, guidance and feedback
      pets/                Cards, filters, detail and staff pet editor
      home/                Tiles, stories, counters and random photo strip
      admin/               Tables, overview, details and workflow controls
      auth/                Member and staff route guards
    context/               Auth, staff access and admin workflow
    hooks/                 Form, submission, catalogue, storage and reveal hooks
    services/              Firebase, auth, records, workflow, photos and EmailJS
    utils/                 Validation, dates, CSV and image processing
    data/                  Pets, image credits, roles and dashboard definitions
    styles/                Feature styles and variables.css
    tests/                 Unit and integration tests, setup and account mocks
  public/images/           Local credited images
  scripts/                 Image-path checker
  docs/                    Handoff, report outline, recording and checklists
  firebase.json            Hosting and Firestore config
  firestore.rules          Firestore access and validation
  .env.example             Environment variable names
```

## Reusable components

- UI includes Button, Card, Badge, Alert, Modal, Toast, Spinner, Skeleton, Accordion, Dropdown, PageBanner, Breadcrumb, SectionHeading and FallbackImage.
- Forms use FormField, FormPageShell, FormGuide, RoleCard, SubmissionFeedback and SubmissionHoneypot.
- Pets use PetCard, PetDetailModal, PetFilters, SearchBar, FavouriteButton and AddPetModal. Home uses ImageTile, StepCard, StatCounter, StoryCard, NewsCard and RandomPetPhoto.
- Staff uses AdminLayout, AdminOverview, AdminSubmissions, AdminPets, DetailPanel, DataTable, FilterBar, StatCard, StatusBadge, EmptyState, QuickActions and AvailabilityControl.

Use PascalCase components and camelCase functions, services and hooks. Prefix hooks with use. Keep data access in services and reuse accessible components and existing CSS tokens.

## Spec generation rules

- One minimal spec per feature.
- At most five acceptance criteria per requirement.
- No diagrams or test plans in generated specs.
