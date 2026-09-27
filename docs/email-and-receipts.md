# Email verification and purchase receipts

Prep sends three kinds of email: the sign-up confirmation link, the receipt for a paid pass, and reminders. All of them go through one sender, `hello@evolw.in`. Nothing is sent until a mailer is configured; until then sign-ups auto-verify and receipts are recorded in `notification_log` with `channel = skipped`, so nothing is lost and nothing is faked.

## 1. Choose how mail leaves the server

The code (`src/lib/server/mailer.ts`) supports three transports, tried in this order: Brevo's API (`BREVO_API_KEY`), Resend (`RESEND_API_KEY`), any SMTP relay (`SMTP_URL`). Only one is needed; `EMAIL_FROM` is required with all of them.

**Option 0: Brevo (what Evolw uses; free for 300 emails a day)**

1. In Brevo → Senders & IP → Senders → Add a sender: name `Prep by EVOLW`, email `hello@evolw.in`. Brevo emails a confirmation to that mailbox; click it. Mail from an unconfirmed sender is refused.
2. Senders & IP → Domains → Add `evolw.in` → Authenticate. Add the DNS records Brevo shows at the registrar of evolw.in: a DKIM TXT (`mail._domainkey` or `brevo._domainkey`), the Brevo code TXT, and, if not present, an SPF TXT on the root containing `include:sendinblue.com` (Brevo's SPF include) and DMARC `_dmarc` = `v=DMARC1; p=none; rua=mailto:hello@evolw.in`. Press Verify. Until the domain is authenticated, Gmail and Outlook may put the mail in spam.
3. SMTP & API → API Keys → Create a new API key (name `Prep production`). Copy it once.
4. Vercel → Project `job-appy` → Settings → Environment Variables → Production:
   - `BREVO_API_KEY` = the `xkeysib-…` key
   - `EMAIL_FROM` = `Prep by EVOLW <hello@evolw.in>`
   (Alternative without the API: `SMTP_URL` = `smtps://bb5714001%40smtp-brevo.com:XSMTP_KEY@smtp-relay.brevo.com:465` using the SMTP login and the `xsmtpsib-…` key; `%40` stands for `@`.)
5. Redeploy. `/admin/launch` then shows "Email delivery: Mailer configured".
6. Any key that was ever pasted into a chat, a ticket or a screenshot should be deleted in Brevo and replaced by a fresh one.

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

- **Forgot password** (`/api/auth/forgot-password`, `/api/auth/reset-password`, page `/reset-password`, `src/lib/server/passwordReset.ts`): "Forgot password?" under the sign-in form emails a single-use link valid for one hour; the answer is the same whether or not the address exists. Without a mailer the button explains that resets go through hello@evolw.in.

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
