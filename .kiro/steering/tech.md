---
inclusion: always
---

# Technical baseline

Version ranges are taken from package.json. Firebase Hosting is configured in firebase.json.

| Area | Stack |
| --- | --- |
| Runtime | Node ^20.19.0 || >=22.12.0, ES modules |
| UI | React ^19.3.0, React DOM ^19.3.0, React Router DOM ^6.30.6 |
| Build | Vite ^8.3.6, @vitejs/plugin-react ^6.2.1 |
| Firebase | Modular firebase ^13.2.0 for Auth and Firestore. Hosting serves dist |
| Mail | @emailjs/browser ^5.0.3 |
| Tests | Vitest ^5.1.0, React Testing Library ^16.3.3, user-event ^14.6.8, jest-dom ^7.0.1, jsdom ^31.0.0 |

## PowerShell from Assignment3

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run build
npm.cmd test -- --maxWorkers=2
npm.cmd run check:images
firebase.cmd deploy --only firestore:rules,hosting --project petheaven-b7766
```

Build first and deploy Firestore rules and Hosting together. Firebase Hosting rewrites browser routes to index.html.

## Browser environment names

- Firebase core uses `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID`.
- Firebase options are `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_STORAGE_BUCKET`, and `VITE_FIREBASE_MESSAGING_SENDER_ID`. The bucket is a config field only.
- EmailJS uses `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_PUBLIC_KEY`, `VITE_EMAILJS_TEMPLATE_ADMIN`, and `VITE_EMAILJS_TEMPLATE_ACK`.
- `VITE_CAT_API_KEY` is optional. Copy names from .env.example and keep local values out of docs and Git.

## Hard constraints

- No Firebase Storage. The project avoids the paid Blaze requirement by storing compressed staff pet images in Firestore.
- The EmailJS free-plan budget for this project is two templates and 200 requests per month. A successful two-email pair uses two requests.
- Firebase Auth handles passwords. Never store, log, or email them. Escape user input in HTML emails. Keep the administrator recipient in EmailJS template settings.
- Use no composite Firestore indexes. Keep bounded dashboard reads, the single-field staff-pet archive query, and client-side filters.
- Use plain CSS and existing CSS variables. No Tailwind or new dependencies for existing features.
