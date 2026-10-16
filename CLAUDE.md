# CLAUDE.md

## What this project is
A prototype template: Vite + React + TypeScript + Tailwind CSS + shadcn/ui +
React Router (`BrowserRouter`) + Supabase client. The user is not technical:
explain things in simple language and handle the code and Git yourself.
All code, comments, commit messages and UI text must be in English.

## Security (most important)
1. Every new table must be created with Row Level Security enabled and at least
   one policy, in the same migration. Never disable RLS "to make it work".
2. Before every commit, check that no table is left without RLS.
3. Never write the Supabase `service_role` key in any file. Only the project URL
   and the anon/publishable key are allowed in this repo.

## Supabase
- When the user connects a Supabase project, read its URL and anon/publishable key
  with the Supabase connector and write them to `.env`
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Commit `.env`: this is intentional,
  these two values are public.
- The client lives in `src/lib/supabase.ts`. Always use it; do not create another one.
- Create tables through migrations, not by hand.

## Routing and deployment
- Use `BrowserRouter`. Do not replace it with `HashRouter`.
- Do not edit `base` in `vite.config.ts` or the `basename` in `src/main.tsx`.
  They configure themselves (the GitHub Pages workflow sets `VITE_BASE`; on Vercel,
  Netlify or locally the default is `/`).
- `.github/workflows/deploy.yml` builds the app, copies `index.html` to `404.html`
  (so direct links and reloads work on GitHub Pages) and publishes it.
  Do not modify it unless the user asks.
- `vercel.json` and `public/_redirects` already allow deploying to Vercel or
  Netlify with no changes. Leave them as they are.
- If the user asks to make the app production-ready or to deploy it elsewhere,
  these files are already prepared; no router change is needed.

## Git workflow
- The main branch is `master`. The preview updates only when changes reach `master`.
- If you work on another branch, merge it into `master` (or open a pull request)
  when the user wants to see the preview.

## Structure and conventions
- Routes are defined in `src/App.tsx`. Pages live in `src/pages/`.
- `src/components/ui/`: shadcn/ui components. Add new ones following the same
  style (or with `npx shadcn@latest add <name>`); `components.json` is configured.
- `src/components/chat/`: `ChatMessage` and `ChatInput`, ready for chat-style apps.
- `src/lib/`: utilities and the Supabase client.
- Style with Tailwind classes only. No separate CSS unless strictly necessary.
- Import with the `@/` alias (maps to `src/`).

## Performance rules for 3D and animation (important)
This app runs on real people's laptops with integrated graphics (for example Intel Iris Xe),
not on a Steam Deck, an Xbox or a gaming PC. A heavy 3D scene froze the whole of Chrome once,
because every tab shares one GPU process. Follow these rules:
1. **Never recompute something expensive 60 times per second.** Anything procedural
   (noise, craters, clouds, terrain) is computed ONCE, baked into a texture (`src/components/solar/bake.ts`),
   and the per-frame shader only reads that texture and applies lighting.
2. Keep every shader small: no nested loops, no repeated noise calls per pixel, no function
   inlined several times. Big shaders also compile very slowly on Windows (ANGLE to Direct3D)
   and can stall the browser at load. Compile with `compileAsync` and bake in small strips, one per frame.
3. Cap the resolution (`dpr` at most 1.25) and keep the quality governor that lowers it when frames
   take longer than about 28 ms. Detect software rendering and drop to a light mode.
4. Do not render what is not visible (offscreen planets, hidden tabs, sections scrolled away).
5. Before shipping 3D or animation work, measure frame time on a weak machine or with software
   rendering (headless Chromium with SwiftShader is the worst case). Target at least 30 fps there.
   If it is fine in software rendering, it will be fine on a laptop.

## The example is temporary
The example pages (home, `/items/:id`, 404) only demonstrate dynamic routes.
Replace or delete them when building the real app.
