---
inclusion: always
---

# Technical baseline

The dependency ranges below are from package.json.

| Area | Stack |
| --- | --- |
| Runtime | Node ^20.19.0 or >=22.12.0, ES modules |
| UI | React and React DOM ^19.3.0, React Router DOM ^6.30.6, plain CSS variables |
| Build | Vite ^8.3.6, @vitejs/plugin-react ^6.2.1 |
| Firebase | Modular firebase ^13.2.0 for Auth and Firestore, Firebase Hosting for dist |
| Mail | @emailjs/browser ^5.0.3 |
| Tests | Vitest ^5.1.0, React Testing Library ^16.3.3, user-event ^14.6.8, jest-dom ^7.0.1, jsdom ^31.0.0 |

## PowerShell commands from Assignment3

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run build
npm.cmd test -- --maxWorkers=2
npm.cmd run check:images
firebase.cmd deploy --only firestore:rules,hosting --project petheaven-b7766
```

Build before deploying. Publish rules and Hosting together. Hosting serves dist and rewrites routes to index.html.

## Browser environment names

- Firebase core: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID.
- Firebase options: VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID. Storage bucket is a config field only.
- EmailJS: VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_TEMPLATE_ADMIN, VITE_EMAILJS_TEMPLATE_ACK.
- Optional cat photos: VITE_CAT_API_KEY. See .env.example. Keep real values out of docs and Git.

## Hard constraints

- No Firebase Storage. This project avoids the paid Blaze requirement by storing compressed staff pet photos in Firestore.
- EmailJS free-plan coursework budget is two templates and 200 requests/month. A successful two-email pair consumes two requests.
- Firebase Auth handles passwords. Never store, log, or email passwords. Escape user input in HTML email and keep the admin recipient in the template settings.
- Avoid composite Firestore indexes. Keep the existing bounded dashboard reads, single-field staff-pet archive query, and client-side filters.
- Reuse plain CSS and existing tokens. Use no Tailwind or new dependencies for existing features.
