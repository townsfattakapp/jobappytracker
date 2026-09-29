# Personal-email referral workflow

## Admin: invite and approve your friends

1. Open `/admin/referrals`. Review employer policy in **Company coverage**, record its source and enable referrals where allowed.
2. Open **Referrers**, enter your friend's **personal email** (Gmail and other providers are supported), select their employer and send the invitation. Invite people who agreed to join. The optional invitation note is internal.
3. Check email-send status. If sending fails or is unconfigured, copy the personal invitation message and share it directly. A provider accepting a message does not guarantee inbox delivery. Save the link before leaving the tab; invitation history never exposes tokens.
4. Your friend must create an account or sign in with the invited address. A different account cannot claim the invitation. Links expire after 14 days and can be accepted once. Ask for a new invitation if an old invitation went to a work address but they want to use Gmail.
5. Your friend completes their profile, acknowledges the employer's referral policy and confirms the personal mailbox using a separate one-hour email link. No corporate address or corporate-email verification is required.
6. Review current employment independently. In **Employment review note**, record how and when you checked it, for example: personally known former colleague; current company and role confirmed on a call. Do not enter confidential employer material. Then select **Verify**. The server requires profile completion, personal-email confirmation and a meaningful review note; the reviewer, note and time are recorded. Email confirmation alone never approves employment.
7. Approval lasts 12 months by default. Your friend sets **Available** and their capacity in `/referrer`. Coverage also requires an eligible company policy and matching role/location support.

## Referrer: review and submit

The portal shows onboarding progress and the next required action. Use **Refresh status** after confirming your email or after an employment review. Confirmation messages may appear in Promotions or Spam; search for `hello@evolw.in` and use the latest link. Provider acceptance is not a delivery receipt.

The request queue defaults to active work. Use **Needs your review**, **Ready to submit**, or **All requests** to focus on the next action or see completed history. Failed message sends preserve the draft for retry.

All invitations, confirmation messages and referral notifications go to the invited personal address. Your account and work-email evidence are separate. JobAppy does not imply employer endorsement.

Use `/referrer` to review assigned candidates, ask questions, accept or decline. After accepting, submit through your employer's official referral process, then mark the referral submitted in JobAppy. Acceptance alone is not a submitted referral. Pause availability whenever needed. Candidates do not receive your email or private review evidence.

Employment details are locked after initial profile submission so an approved identity cannot be silently replaced. Contact support for corrections or an employment change; admins should pause/suspend the old profile and review eligibility before restoring access. There is no self-service contact-email change in this release.

## Candidate

Open **Referral Center > Find a job to request a referral**, choose a job and use its **Referral** tab. Check readiness using a resume, explain your experience and consent to sharing it with the assigned employee. Plan eligibility, policy, capacity and request limits are checked by the service.

Submission reserves a credit when required. Reply to questions in **Needs action**. Acceptance consumes the reserved credit. Once the employee marks the referral submitted, add it to your tracker. A request does not guarantee a referral, interview or job.

## Admin: exceptions

Search **Requests** by company, role or candidate email and filter by status. Request details can be opened with the keyboard. In **Referrers**, search names, personal emails and companies; **Ready for employment review** shows pending profiles with completed onboarding and confirmed email. Profile-status filters apply to profiles; the search also filters invitation history. Lists reflect the records returned by the console (invitation history is capped at the latest 200). Refresh the network to pick up new activity.

Use **Requests** for messages, status history, assignment and matching retries. Declines and timeouts can trigger another match within configured limits. Unused reservations are released on closure; refunds after acceptance depend on the close reason. Use **Beta settings** for timeouts, credit requirements and expiry sweeps. A visitor without an invitation can draft an invitation request to the team; public self-service applications remain unavailable.

## Deployment

- Apply journal migration `0017_referrer_personal_email` using the repository's migration process before deploying code that reads the new columns. It adds nullable contact email and confirmation time columns, backfills contact email from existing account email, and preserves legacy work-email evidence and employment approvals. It does not invent personal-email confirmation for existing accounts. Existing approved referrers keep access; later re-approval requires personal-email confirmation and a review note.
- Use the production migration preflight and runbook; do not run a development migration against production. Test the migration on a backup/staging database first. The additive columns allow reverting application code without dropping historical data.
- Configure a supported email provider and `EMAIL_FROM`; see [email-and-receipts.md](email-and-receipts.md). Verify the configured site URL generates HTTPS invitation and confirmation links for your deployed domain.
- Verify the referral expiry cron is configured. Confirm your admin role is assigned only to trusted operators.
- Smoke-test one invitation, sign-up continuation, personal-email confirmation, documented admin approval, availability, candidate review and referral submission in staging.
- Email failures never confirm a mailbox. Verification requests are limited to three per referrer per day. Resending invalidates earlier links; confirmation requires an explicit click and is bound to the stored contact address. Work-email links issued before the migration can still confirm legacy evidence but never confirm a different personal address.

Automated coverage includes the personal-email lifecycle, invitation replay and wrong-account rejection, resend/expiry, delivery failure, private-field exclusion, migration of a legacy approved profile, and the broader referral lifecycle. Browser tests use an isolated local database and synthetic accounts; local email confirmation is a controlled fixture, not proof of real-provider delivery.
