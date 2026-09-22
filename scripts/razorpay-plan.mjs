// Creates the monthly ₹199 plan in your Razorpay account and prints its id.
// Run once per Razorpay account (test and live have separate plans):
//   RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=... node scripts/razorpay-plan.mjs
// Then set RAZORPAY_PLAN_ID to the printed id in Vercel.
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local', quiet: true })

const keyId = process.env.RAZORPAY_KEY_ID
const keySecret = process.env.RAZORPAY_KEY_SECRET
if (!keyId || !keySecret) {
  console.error('Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET first.')
  process.exit(1)
}

const res = await fetch('https://api.razorpay.com/v1/plans', {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    period: 'monthly',
    interval: 1,
    item: { name: 'Prep Pro', amount: 19900, currency: 'INR', description: 'Prep by EVOLW · monthly subscription' },
    notes: { app: 'prep' },
  }),
})
const data = await res.json()
if (!res.ok) {
  console.error('Razorpay error:', data?.error?.description || res.status)
  process.exit(1)
}
console.log(`Plan created: ${data.id}`)
console.log(`Set RAZORPAY_PLAN_ID=${data.id}`)
