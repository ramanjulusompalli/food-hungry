# Food Hungry Free Cloud Plan

Free tiers change often, so verify limits before final deployment.

## Recommended Free/Low-Cost Stack

- Web app: Vercel or Netlify free tier.
- Android/iOS app builds: Expo EAS free allowance where available, or local Android build.
- Backend services: Render, Koyeb, Railway-style provider, or Fly.io if free allowance is available.
- Database: Supabase free Postgres or Neon free Postgres.
- Images: Cloudinary free tier.

## Important Store Costs

- Google Play Console requires a US$25 one-time registration fee.
- Apple App Store requires Apple Developer Program membership, usually US$99 per year.

So development and cloud testing can be free, but public store publishing is not completely free.

## Deployment Order

1. Push code to GitHub.
2. Create Supabase or Neon Postgres database.
3. Deploy `restaurant-service`.
4. Deploy `order-service`.
5. Deploy `api-gateway`.
6. Configure gateway service URLs.
7. Deploy Expo web app to Vercel/Netlify.
8. Build Android `.aab` for Play Store.
9. Prepare Play Store listing, screenshots, privacy policy, and testing track.
