# Elytra — Client

React frontend for the Elytra full-stack template. For the big picture and deployment, see the [root README](../README.md).

## Stack

- React 19, TypeScript, Vite, Tailwind, shadcn/ui, Redux Toolkit, React Query, React Router.

## Quick start

```bash
npm install
npm run dev
```


## Customize app name and branding

Edit **`src/data/`** (e.g. `app.ts`, `assets.ts`, `favicon.ts`) to change app name, links, contact emails, and assets to your liking.

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — ESLint

## More detail

- API layer: `src/api/` (axios instance, React Query).
- Auth: Cognito-ready; tokens in sessionStorage/localStorage; see `src/store/userSlice.ts` and `src/components/forms/`.
- UI: shadcn components in `src/components/ui/`; add more with `npx shadcn add <component>`.

For full-stack setup and CI/CD, see the [root README](../README.md).
