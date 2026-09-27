import { PLANS } from '../../lib/billing/plan'

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

const FAQ_ITEMS = [
  {
    q: 'Can I try it before paying?',
    a: 'Yes. Create a free account and use Job Discovery (a sample of live openings), the resume workspace, the tracker and the general curriculum browser. A pass unlocks the learning workspaces, the code runner, AI features, the full ranked job feed and job-specific mock interviews.',
  },
  {
    q: 'Is paying safe, and do I get a receipt?',
    a: 'Payments are processed by Razorpay (UPI, cards, net banking); Prep never sees or stores your card or UPI details. Every purchase gets a receipt with the Razorpay payment id, emailed to you and always available under Settings → Billing.',
  },
  {
    q: 'What if something goes wrong with my purchase?',
    a: 'Duplicate charges and any failure to deliver access are refunded in full; the refund policy also has a cooling-off window for passes that were not used. Write to hello@evolw.in with the payment id from your receipt and a human answers, not a bot.',
  },
  {
    q: 'Where do the job openings come from?',
    a: 'Directly from each company’s own careers feed, refreshed daily, with the original application link. Nothing is copied from job boards and no opening is invented: if a company stops listing a role, it disappears here too. The counts on this page are read live from the database.',
  },
  {
    q: 'Why do I need my own OpenAI or Groq key?',
    a: 'Because it keeps a 90-day pass at ₹199 and puts you in control. Groq has a free tier that covers normal daily use; OpenAI usage for a heavy week is usually a few rupees. Your key is encrypted at rest and only ever sent to the provider you chose.',
  },
  {
    q: 'Which disciplines and tracks are covered in the curriculum?',
    a: 'Prep features 157 complete tracks across 12 disciplines: AI & Generative AI (LLMs, RAG, Agents, MLOps, Computer Vision), Backend Frameworks (Spring Boot, Node.js, FastAPI, Go, Django, gRPC), Frontend & Web (React, Next.js, TypeScript, Vue, Svelte, Web Performance), Cloud & DevOps (AWS, Azure, GCP, Docker, Kubernetes, Terraform, CI/CD), Mobile (Flutter, React Native, Kotlin, Swift), Data Engineering & Science (Spark, Kafka, Airflow, dbt, Pandas, Power BI), Cybersecurity (AppSec, Cloud Security, Threat Modeling), CS Fundamentals (OS, Networks, DBMS, Distributed Systems), and Software Engineering Interviews (DSA, HLD, LLD). You can code in Java, Python, C++, Go, TypeScript, JavaScript, Rust, Kotlin, Swift, Dart, and SQL.',
  },
  {
    q: 'Can I follow a pre-made career roadmap instead of choosing individual tracks?',
    a: 'Yes. Prep includes 20 pre-built Career Path Blueprints for roles like AI Engineer, Generative AI Engineer, Full-Stack Developer, Frontend Developer, Java Backend Developer, Python Backend Developer, DevOps Engineer, Cloud Architect, Flutter Developer, Data Scientist, Data Engineer, and SWE Interview Prep. You can use any blueprint as-is or customize it by adding, removing, or reordering topics to match your exact interview timeline.',
  },
  {
    q: 'Is there a subscription or auto-renewal?',
    a: 'No. You buy a pass for 90 days, 180 days or a year with one payment. Nothing renews by itself, and buying another pass simply adds its days to the end of the current one.',
  },
  {
    q: 'What happens when my pass ends?',
    a: 'Nothing is deleted. Your plan, notes, attempts and mock-interview reports stay in your account. The learning workspaces, AI and the code runner pause until you pick a new pass.',
  },
  {
    q: 'How do mock interviews work?',
    a: 'Pick a round such as DSA coding, system design, React or behavioural, a difficulty and a duration. An AI interviewer asks questions out loud, listens to your answers, pushes back on gaps, and gives you a scorecard with model answers and topics to revise.',
  },
  {
    q: 'Does it work on my phone?',
    a: 'Yes. Everything syncs to your account, so the plan you build on a laptop is on your phone in the morning, including attempts and notes.',
  },
  {
    q: 'Who is behind Prep?',
    a: 'Prep is built and run by Evolw (www.evolw.in), a small product team in India. There is one support address, hello@evolw.in, and it is read by the people who build the product.',
  },
  {
    q: 'What happens to my data?',
    a: 'Your plan, notes, resume versions and reports belong to you: export everything as a file from Settings at any time, and delete the account yourself from the Data Controls page. AI keys are encrypted at rest; resumes never leave your account.',
  },
]

export function HomepageJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prep.evolw.in'

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Prep by EVOLW',
    url: siteUrl,
    description:
      '157 structured engineering tracks across 12 disciplines, runnable worked examples, interactive system design, AI mock interviews, and job hunting tracker.',
    publisher: {
      '@type': 'Organization',
      name: 'Evolw Technologies',
      url: 'https://www.evolw.in',
      logo: `${siteUrl}/logo.svg`,
    },
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Evolw Technologies',
    legalName: 'Evolw Technologies',
    url: 'https://www.evolw.in',
    logo: `${siteUrl}/logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '',
      contactType: 'Customer Support',
      email: 'hello@evolw.in',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: ['https://www.evolw.in'],
  }

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Prep by EVOLW',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All (Modern Web Browser)',
    url: siteUrl,
    description:
      '157 structured engineering tracks across 12 disciplines: Generative AI, Full-Stack, Backend, Mobile, Cloud, DevOps, Cybersecurity, Data Science, Systems & DSA. Explanations from zero, runnable worked examples, interactive system design, AI mock interviews, and your job hunt in one tab.',
    offers: PLANS.map((plan) => ({
      '@type': 'Offer',
      name: `${plan.name} (${plan.days} Days Pass)`,
      price: plan.priceInr.toString(),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/pricing`,
      priceValidUntil: '2027-12-31',
    })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={softwareApplicationSchema} />
      <JsonLd data={faqSchema} />
    </>
  )
}

export function PricingJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prep.evolw.in'

  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Prep by EVOLW Access Passes',
    description:
      'One-time access passes for Prep by EVOLW engineering learning tracks, mock interviews, system design studio, and job hunt portal. No recurring subscriptions.',
    brand: {
      '@type': 'Brand',
      name: 'Prep by EVOLW',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: Math.min(...PLANS.map((p) => p.priceInr)).toString(),
      highPrice: Math.max(...PLANS.map((p) => p.priceInr)).toString(),
      offerCount: PLANS.length.toString(),
      offers: PLANS.map((plan) => ({
        '@type': 'Offer',
        name: `${plan.name} (${plan.days} Days)`,
        price: plan.priceInr.toString(),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}/pricing`,
      })),
    },
  }

  return <JsonLd data={pricingSchema} />
}

export function ContactJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prep.evolw.in'

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact & Support · Prep by EVOLW',
    url: `${siteUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Evolw Technologies',
      url: 'https://www.evolw.in',
      email: 'hello@evolw.in',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: 'hello@evolw.in',
        },
        {
          '@type': 'ContactPoint',
          contactType: 'Billing Inquiries',
          email: 'hello@evolw.in',
        },
      ],
    },
  }

  return <JsonLd data={contactSchema} />
}
