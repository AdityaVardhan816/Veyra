# Veyra Build Roadmap

## Product Vision
Veyra is a premium game-discovery and rating platform with a cinematic browsing experience (Netflix-style) and deep game metadata + community ratings (IMDb-style).

## MVP Scope (Phase 1)
1. Dark premium UI with homepage rails and hero section
2. Game detail pages with metadata, trailers, DLC block, rating summary
3. User accounts and profile page
4. Ratings (1-10) and text reviews with spoiler toggle
5. Search page and basic filtering (genre/platform/rating)

## Phase 2
1. News feed and leak flagging per game
2. Watchlist and recommendation rails
3. Review moderation workflow for admin/moderators
4. Content ingestion jobs + cache strategy

## Phase 3
1. Personalized home rails and trending algorithm
2. Social layer (followers/activity)
3. Advanced analytics and dashboard

## Proposed Delivery Plan
1. Foundation (routing, theme system, Prisma, auth)
2. Catalog and details (game lists, details, trailers, DLC)
3. Community (ratings, reviews, profile history)
4. Discovery (search/filter/sort)
5. Moderation + deployment

## APIs and Data Strategy
- Start with seeded + curated data in Postgres.
- Add external providers (e.g., IGDB/RAWG/YouTube metadata) through scheduled ingestion jobs.
- Cache external API responses in database tables to avoid rate limits.

## Non-Functional Requirements
- SEO-friendly game pages (metadata + structured content)
- A11y baseline (keyboard + contrast)
- Performance budget: fast hero load, lazy-loaded rails
- Audit-friendly moderation logs

## Immediate Next Build Items
1. Install Node.js LTS and dependencies
2. Run Prisma migration and generate client
3. Implement NextAuth + protected profile routes
4. Replace mock data with database-backed queries
