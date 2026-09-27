# Email verification and purchase receipts

Prep sends three kinds of email: the sign-up confirmation link, the receipt for a paid pass, and reminders. All of them go through one sender, `hello@evolw.in`. Nothing is sent until a mailer is configured; until then sign-ups auto-verify and receipts are recorded in `notification_log` with `channel = skipped`, so nothing is lost and nothing is faked.

## 1. Choose how mail leaves the server

The code (`src/lib/server/mailer.ts`) supports two transports. Only one is needed.

**Option A: Resend (recommended, about 10 minutes, free for 3 000 emails a month)**

1. Create an account at https://resend.com with the `hello@evolw.in` mailbox.
2. Domains → Add domain → `evolw.in`. Resend shows three DNS records (DKIM `resend._domainkey`, SPF/return-path `send`, and an MX for bounces). Add them at the DNS host of evolw.in and press Verify.
3. API Keys → Create → "Prep production", permission *Sending access*, domain `evolw.in`. Copy the key (shown once).
4. In Vercel → Project `job-appy` → Settings → Environment Variables → **Production**:
   - `RESEND_API_KEY` = the key
   - `EMAIL_FROM` = `Prep by EVOLW <hello@evolw.in>`
5. Redeploy (Deployments → ⋯ → Redeploy). From that moment `isMailerConfigured()` is true.

**Option B: SMTP of the mailbox provider (Zoho Mail / Google Workspace)**

1. Create an app password for `hello@evolw.in` (Zoho: Security → App passwords; Google: Security → 2-step verification → App passwords).
2. In Vercel add:
   - `SMTP_URL` = `smtps://hello%40evolw.in:APP_PASSWORD@smtp.zoho.in:465` (Google: `smtps://hello%40evolw.in:APP_PASSWORD@smtp.gmail.com:465`). The `@` in the address must be written `%40`.
   - `EMAIL_FROM` = `Prep by EVOLW <hello@evolw.in>`
3. Redeploy.

Either way, add an SPF record for the provider you use so receipts do not land in spam, and keep DMARC at `p=none` until a week of mail has gone out cleanly.

## 2. What turns on by itself once the mailer exists

- **Sign-up verification** (`src/lib/auth.ts`, `src/lib/server/verification.ts`): new accounts get "Confirm your email for Prep by EVOLW" with a single-use link (SHA-256 hashed token, 24 h). Until the link is opened the account exists but `emailVerified` is null and the app shows the "check your inbox" screen with a resend button (`/api/auth/resend`). Accounts created before the mailer was configured stay verified.
- **Receipts** (`src/lib/server/receipts.ts`): when Razorpay confirms a pass (`grantOrder`, from the checkout handler or the webhook, whichever arrives first) the buyer gets "Receipt PREP-YYYYMMDD-XXXXXX: your Prep pass (90 days)" with number, date, buyer, item, access period, amount, Razorpay payment id and seller. The same receipt is listed under Settings → Billing → Receipts and opens as a printable page (`/api/billing/receipts/{orderId}`, owner only) that can be saved as PDF from the browser.
- **Reminders** (application follow-ups, outreach) from the daily cron once `CRON_SECRET` is set.

## 3. Seller details on the receipt

Optional environment variables, shown when present:

| Variable | Shown as |
|---|---|
| `BUSINESS_NAME` | Seller name (default `Evolw`) |
| `BUSINESS_EMAIL` | Seller contact (default `hello@evolw.in`) |
| `BUSINESS_ADDRESS` | Registered address line |
| `BUSINESS_GSTIN` | GSTIN line; without it the receipt says it is a payment receipt, not a GST tax invoice |

If Evolw registers for GST, set `BUSINESS_GSTIN` and the address, and the receipt wording changes accordingly. Prices in `src/lib/billing/plan.ts` are the amounts charged; the receipt shows them as inclusive of all charges.

## 4. Checking it works

1. Settings → Account → "Resend confirmation" on a fresh test account: the email arrives from `hello@evolw.in`.
2. Buy the 90-day pass with a Razorpay test card (or use the fixture provider in staging): the receipt email arrives and the receipt appears under Settings → Billing.
3. `/admin/launch` shows "Email delivery: Mailer configured".
4. `notification_log` (via `/admin/audit` or SQL) shows `payment.receipt` rows with `channel = email`, `status = sent`.

Test suite: `npm run test:receipts` (receipt generation, idempotency, buyer-only access, email and print renderings).
