# Rate limiting & staying on free tiers

Written 2026-07-25, when MONARQ was pre-launch (12 profiles, 6 active
members) and committed to free tiers only — no paid Supabase, no paid
Vercel, no paid API keys.

## The short version

You are **not currently at risk of a bill.** Vercel Hobby and Supabase
Free have no payment method attached, so there is nothing to charge. If
you exceed limits, they throttle or suspend — they do not invoice.

The realistic risk is the opposite one: **Supabase pauses Free-plan
projects after ~7 days of low activity.** Pre-launch, with almost no
traffic, that is the most likely way MONARQ goes down. You restore it
from the Supabase dashboard; only a Pro upgrade prevents it happening.

## Already protecting you, no setup needed

| Layer | What it does | Cost |
|---|---|---|
| Vercel DDoS mitigation | Automatic on every plan incl. Hobby. Covers L3/L4/L7. | Free |
| Vercel billing exclusion | Vercel does **not** bill for traffic blocked by DDoS mitigation or the WAF — you only pay for what was served before mitigation kicked in. | Free |
| Supabase Auth rate limits | On by default. Token bucket, 30-request capacity, per IP, returns 429. Covers sign-in, sign-up, token refresh, email sends. | Free |
| `proxy.ts` | Everything except `/login`, `/onboarding`, `/auth/callback`, `/pending` and `/api/*` redirects signed-out visitors to `/login`, so there is very little unauthenticated surface. | Free |
| `access_code_attempts` (0044) | 10 failed invite-code guesses per user per hour, then locked out. | Free |

## Done in code (migration 0044)

Supabase's auth rate limits only apply to `/auth/v1/*`.
`redeem_access_code` is a PostgREST RPC at `/rest/v1/rpc/`, so it was
never covered. With email confirmation off, anyone could sign up, sit in
`pending`, and brute-force invite codes. That is closed now.

To review lockouts (admin only — members cannot read this table):

```sql
select user_id, count(*), max(attempted_at)
from public.access_code_attempts
where attempted_at > now() - interval '1 hour'
group by user_id
order by count(*) desc;
```

To clear a lockout for someone who genuinely fumbled their code:

```sql
delete from public.access_code_attempts where user_id = '<uuid>';
```

## Supabase — tighten auth rate limits (dashboard, 2 minutes)

Go to **Authentication → Rate Limits**:
`https://supabase.com/dashboard/project/ygdvyfvcfglxvdckacyj/auth/rate-limits`

Defaults are already sane. The ones worth lowering while the member base
is tiny, because nothing legitimate should come near them:

| Setting | Suggested | Why |
|---|---|---|
| Rate limit for sign-ups / sign-ins | 10 per hour per IP | Invite-only; nobody should be signing in dozens of times an hour |
| Rate limit for sending emails | 5 per hour | You have ~6 members and a Resend free tier to protect |
| Rate limit for token refresh | leave default | Lowering this logs real users out |
| Rate limit for anonymous users | 0 / disabled | You do not use anonymous sign-ins |

Raise these before any launch push — a real onboarding wave will trip
them.

## Vercel — WAF rate limiting (needs the CLI installed first)

The Vercel CLI is not installed in this project, so this cannot be done
from a Claude session. Either use the dashboard, or:

```bash
npm i -g vercel
vercel link
```

Then stage a rule. **Always start with `log`, never `deny`** — a
mis-scoped rule blocks real users:

```bash
vercel firewall rules add "Rate limit auth endpoints" \
  --condition '{"type":"path","op":"pre","value":"/login"}' \
  --action rate_limit \
  --rate-limit-window 60 \
  --rate-limit-requests 30 \
  --rate-limit-keys ip \
  --rate-limit-action log \
  --yes

vercel firewall diff        # review
vercel firewall publish --yes
```

Watch it for a day at
`https://vercel.com/<team>/monarq-os/firewall/traffic`, confirm only
abusive traffic matches, then switch `--rate-limit-action` to
`rate_limit` (429).

Worth covering, in priority order:

1. `/login` — credential stuffing. 30/min per IP is generous.
2. `/onboarding` — invite-code guessing. Belt-and-braces on top of 0044,
   which already handles it at the database level.
3. `/api/cron/nudges` — already returns 401 without `CRON_SECRET`, so
   this is only about not paying to serve rejections. Low priority.

Note: rate-limit counters are **per region**, so N regions can
collectively exceed the configured limit by roughly N×. Set limits with
that headroom in mind.

## What is deliberately NOT here

- **No paid add-ons.** No Upstash/Redis-backed rate limiting, no
  Observability Plus, no Pro-tier features. Everything above is free.
- **No `@vercel/firewall` SDK usage.** `checkRateLimit()` needs a Rate
  Limit ID configured in the WAF dashboard first, so it buys nothing
  over a plain WAF rule at this scale.
- **No payments hardening**, because there are no payments and there
  never will be — see `docs/V3-PLAN.md` and the cancelled Phases 5/6.

## Revisit this when

- You get real members → raise the Supabase auth limits before launch.
- Traffic becomes real → move the Vercel WAF rules from `log` to
  `rate_limit`.
- You upgrade Supabase to Pro → the 7-day inactivity pause stops being a
  concern.
