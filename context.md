# Project Brief: Subscription Scanner Tool
## Context
An existing website needs a new tool added to it. The tool allows a user to discover all their active subscriptions automatically, just by authenticating with their email provider. No manual data entry, no database, no paid third-party services.

## What It Does (User Flow)

User visits the tool page on the website
User clicks "Sign in with Google" (or Outlook)
OAuth consent screen asks for read-only inbox access — no password ever touches the app
App scans the inbox using server-side search queries
Results are displayed grouped and categorized within 1–2 seconds
Nothing is stored — everything is fetched live and discarded after the session


# Technical Architecture
## Authentication

Gmail: Google OAuth 2.0 — scope: gmail.readonly
Outlook: Microsoft OAuth 2.0 (Azure App Registration) — scope: Mail.Read
No passwords, no database, no session persistence
Both are free at this scale

## Inbox Scanning — 5-Layer Strategy
### Layer 1 — Server-side search query (single API call)
Never fetch all emails. Use Gmail/Outlook's own search engine:

Primary filter: has:unsubscribe — Gmail already tags every commercial email that contains a legal unsubscribe header (CAN-SPAM / GDPR compliant senders are required to include it)
Secondary filter layered on top: subject keywords — invoice, receipt, billing, subscription, your plan, your order
Returns only matching message IDs — typically 50–300 results even for a 10,000 email inbox

### Layer 2 — Two-phase fetching

Phase 1: fetch IDs only from the search query (fast, 1 call)
Phase 2: batch fetch metadata only (From, Subject, Date headers) — never full email bodies
Full body is only fetched on-demand if the user explicitly requests details (e.g. price, next billing date)
Gmail API supports format=metadata + metadataHeaders to make this lightweight

### Layer 3 — Deduplication by sender domain

Group all results by sender domain (e.g. all Netflix emails → one entry)
Keep only the most recent email per domain
Reduces ~200 raw results to ~30 unique senders — done client-side, instant

### Layer 4 — Classification into confidence tiers

Tier 1 — Known services: hardcoded lookup table of ~200 known subscription domains (netflix.com, spotify.com, notion.so, etc.) → high confidence, can display logo
Tier 2 — Likely paid: no domain match, but subject/sender contains payment signals (invoice, receipt, €, $, amount patterns) → medium confidence
Tier 3 — Free/newsletter: matched has:unsubscribe but no payment signals → likely newsletter or free plan

### Layer 5 — Progressive rendering

Don't wait for all results — render as pages come in
Gmail API paginates up to 500 IDs per page; process page 1, display it, fetch page 2 in background
Show a live progress indicator: Scanning your inbox… Found so far: Netflix, Spotify, Adobe…

## No Database Required

OAuth tokens are short-lived and held in memory for the session only
No user data is persisted anywhere
Every scan is stateless and fresh


# Output / UI
Results displayed in three grouped sections:
 - Paid subscriptions (Tier 1 + Tier 2)
 - Newsletters & free plans (Tier 3)
 - Unclassified (low-signal matches)

Each card shows: service name/logo (if known), sender email, date of most recent email, subject line. Full body fetch only on user click.

# Known Limitations
LimitationReasonGmail and Outlook onlyOther providers (Yahoo, etc.) have no equivalent OAuth+search APIMay miss very old subscriptionsIf the only email is years old and unsearchableCan't detect cash or in-person paymentsNo email trailFree newsletters look like subscriptionsHard to distinguish without payment signalsApple Hide My Email aliasesxyz@privaterelay.appleid.com — sender domain is unresolvableUser must trust the app with inbox read accessStandard OAuth consent, but still a friction point

# Suggested Build Order

Gmail OAuth flow (login, token, scope)
Search query + ID fetch (has:unsubscribe + keyword filter)
Batch metadata fetch (From, Subject, Date)
Deduplication + grouping by domain
Classification (known-domain lookup table + keyword scoring)
Progressive UI rendering with loading states
Outlook OAuth as second provider (same pipeline, different API syntax)


# Constraints

No paid services
No database
No manual user input beyond OAuth login
No password ever handled by the app
Read-only inbox access only