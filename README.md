This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Portfolio structure

- `/` introduces Adrian and links to the two portfolios.
- `/dev` combines development projects with development tools.
- `/creative` combines creative projects, design/video/print/photo showcases, and creative tools.
- `/about`, `/blog`, and `/contact` are shared pages. Experience and achievements live on `/about`.
- `/projects?mode=developer` and `/projects?mode=creative` remain available as archive links. Legacy home links using `?mode=` redirect to the corresponding portfolio.

Project categories and creative media continue to use the existing Supabase tables and admin pages; no database migration is required. Tool categories are defined in `src/data/techstack.tsx`. Portfolio URLs take precedence over a saved browser preference or conflicting `mode` parameter.

Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` for local CMS content. Keep the existing production environment variables when deploying. Use `npm run build` to check the production build.

### Run locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<!-- trigger deployment: stable revert to 86 score -->
