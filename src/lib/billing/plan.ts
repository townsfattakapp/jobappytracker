/** The single paid plan. Amounts are in paise for Razorpay and rupees for display. */
export const PLAN = {
  name: 'Prep Pro',
  priceInr: 199,
  amountPaise: 19900,
  currency: 'INR',
  period: 'monthly' as const,
  /** Free days after sign-up before a subscription is required. */
  trialDays: 7,
  features: [
    'Every learning track: DSA, Java, JavaScript, React, Node, SQL, system design, CS fundamentals, DevOps',
    'Personal day-by-day plan with spaced revision',
    'AI lessons, worked examples, diagrams, quizzes and the AI tutor, using your own OpenAI or Groq key',
    'Code runner for Java, Python, C++, Go, TypeScript and JavaScript',
    'Job tracker with Gmail sync and interview prep notes',
    'Cloud sync across every device',
  ],
}
