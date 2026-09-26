/**
 * Curated product/technology company SOURCE CATALOG for Job Discovery.
 *
 * This is a catalog of companies and where their official listings come
 * from, not a list of jobs. Every entry keeps the official careers page.
 * A `feed` is present only where a public, documented job-board API exists
 * (Greenhouse Job Board API, Lever Postings API, Ashby Job Board API) AND
 * the board token answered a read-only probe on `verifiedAt` with listings
 * that belong to this company. Companies whose careers portal has no such
 * feed are stored as `Not configured` with `portal: 'careers-site'`; they
 * are never marked as integrated. No portal is scraped, no anti-bot
 * measure is bypassed and no third-party copies are used.
 */
export type CatalogFeedProvider = 'greenhouse' | 'lever' | 'ashby'
export type IndiaRelevance = 'strong' | 'moderate' | 'international'

export interface CatalogFeed {
  provider: CatalogFeedProvider
  /** Board token (Greenhouse/Ashby) or site (Lever). */
  token: string
  /** Read-only probe against the official API that confirmed the token and the company identity. */
  verifiedAt: string
  jobsAtVerification: number
  note?: string
}

export interface CatalogCompany {
  slug: string
  name: string
  website: string
  careersUrl: string
  headquarters: string
  industry: string
  indiaRelevance: IndiaRelevance
  /** Role category ids from src/lib/jobs/taxonomy.ts that this company typically hires for. */
  roleFamilies: string[]
  feed: CatalogFeed | null
  /** Where listings live when there is no supported feed. */
  portal: 'careers-site' | CatalogFeedProvider
  notes?: string
}

export const CATALOG_PROVENANCE = 'company-catalog-2026-09'
const VERIFIED = '2026-09-25'
const ENG = ['software-engineer', 'backend', 'frontend', 'full-stack', 'devops-cloud']
const ENG_DATA = [...ENG, 'data-engineer', 'data-scientist', 'ai-ml']
const ENG_MOBILE = [...ENG, 'mobile']
const ALL = [...ENG_DATA, 'mobile', 'java', 'nodejs', 'react-nextjs', 'data-analyst', 'cybersecurity']

export const COMPANY_CATALOG: CatalogCompany[] = [
  // ---- Global product companies with large India engineering centres (careers portals, no public feed) ----
  { slug: 'microsoft', name: 'Microsoft', website: 'https://www.microsoft.com/', careersUrl: 'https://careers.microsoft.com/', headquarters: 'Redmond, US · India: Hyderabad, Bengaluru, Noida', industry: 'Cloud, productivity, AI', indiaRelevance: 'strong', roleFamilies: ALL, feed: null, portal: 'careers-site' },
  { slug: 'google', name: 'Google', website: 'https://www.google.com/', careersUrl: 'https://www.google.com/about/careers/applications/', headquarters: 'Mountain View, US · India: Bengaluru, Hyderabad, Pune', industry: 'Search, cloud, AI', indiaRelevance: 'strong', roleFamilies: ALL, feed: null, portal: 'careers-site' },
  { slug: 'amazon', name: 'Amazon', website: 'https://www.amazon.com/', careersUrl: 'https://www.amazon.jobs/', headquarters: 'Seattle, US · India: Bengaluru, Hyderabad, Chennai', industry: 'E-commerce, cloud', indiaRelevance: 'strong', roleFamilies: ALL, feed: null, portal: 'careers-site' },
  { slug: 'adobe', name: 'Adobe', website: 'https://www.adobe.com/', careersUrl: 'https://careers.adobe.com/', headquarters: 'San Jose, US · India: Noida, Bengaluru', industry: 'Creative and document software', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'atlassian', name: 'Atlassian', website: 'https://www.atlassian.com/', careersUrl: 'https://www.atlassian.com/company/careers', headquarters: 'Sydney, AU · India: Bengaluru', industry: 'Developer collaboration tools', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'salesforce', name: 'Salesforce', website: 'https://www.salesforce.com/', careersUrl: 'https://careers.salesforce.com/', headquarters: 'San Francisco, US · India: Hyderabad, Bengaluru', industry: 'CRM and enterprise cloud', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'oracle', name: 'Oracle', website: 'https://www.oracle.com/', careersUrl: 'https://www.oracle.com/careers/', headquarters: 'Austin, US · India: Bengaluru, Hyderabad', industry: 'Databases and cloud', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'sap', name: 'SAP', website: 'https://www.sap.com/', careersUrl: 'https://jobs.sap.com/', headquarters: 'Walldorf, DE · India: Bengaluru', industry: 'Enterprise software', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'servicenow', name: 'ServiceNow', website: 'https://www.servicenow.com/', careersUrl: 'https://careers.servicenow.com/', headquarters: 'Santa Clara, US · India: Hyderabad', industry: 'Workflow platform', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'intuit', name: 'Intuit', website: 'https://www.intuit.com/', careersUrl: 'https://www.intuit.com/careers/', headquarters: 'Mountain View, US · India: Bengaluru', industry: 'Fintech software', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'cisco', name: 'Cisco', website: 'https://www.cisco.com/', careersUrl: 'https://jobs.cisco.com/', headquarters: 'San Jose, US · India: Bengaluru', industry: 'Networking and security', indiaRelevance: 'strong', roleFamilies: [...ENG, 'cybersecurity'], feed: null, portal: 'careers-site' },
  { slug: 'nvidia', name: 'NVIDIA', website: 'https://www.nvidia.com/', careersUrl: 'https://www.nvidia.com/en-in/about-nvidia/careers/', headquarters: 'Santa Clara, US · India: Bengaluru, Pune, Hyderabad', industry: 'GPUs and AI computing', indiaRelevance: 'strong', roleFamilies: [...ENG, 'ai-ml'], feed: null, portal: 'careers-site' },
  { slug: 'amd', name: 'AMD', website: 'https://www.amd.com/', careersUrl: 'https://www.amd.com/en/corporate/careers', headquarters: 'Santa Clara, US · India: Bengaluru, Hyderabad', industry: 'Semiconductors', indiaRelevance: 'strong', roleFamilies: [...ENG, 'ai-ml'], feed: null, portal: 'careers-site' },
  { slug: 'qualcomm', name: 'Qualcomm', website: 'https://www.qualcomm.com/', careersUrl: 'https://careers.qualcomm.com/', headquarters: 'San Diego, US · India: Hyderabad, Bengaluru, Chennai', industry: 'Wireless and semiconductors', indiaRelevance: 'strong', roleFamilies: ENG_MOBILE, feed: null, portal: 'careers-site' },
  { slug: 'uber', name: 'Uber', website: 'https://www.uber.com/', careersUrl: 'https://www.uber.com/careers/', headquarters: 'San Francisco, US · India: Bengaluru, Hyderabad', industry: 'Mobility platform', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'walmart-global-tech', name: 'Walmart Global Tech', website: 'https://tech.walmart.com/', careersUrl: 'https://careers.walmart.com/', headquarters: 'Bentonville, US · India: Bengaluru, Chennai', industry: 'Retail technology', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'paypal', name: 'PayPal', website: 'https://www.paypal.com/', careersUrl: 'https://www.paypal.com/us/webapps/mpp/jobs', headquarters: 'San Jose, US · India: Bengaluru, Chennai, Hyderabad', industry: 'Payments', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'autodesk', name: 'Autodesk', website: 'https://www.autodesk.com/', careersUrl: 'https://www.autodesk.com/careers', headquarters: 'San Francisco, US · India: Bengaluru, Pune', industry: 'Design software', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'palo-alto-networks', name: 'Palo Alto Networks', website: 'https://www.paloaltonetworks.com/', careersUrl: 'https://jobs.paloaltonetworks.com/', headquarters: 'Santa Clara, US · India: Bengaluru', industry: 'Cybersecurity', indiaRelevance: 'moderate', roleFamilies: [...ENG, 'cybersecurity'], feed: null, portal: 'careers-site' },
  { slug: 'booking-com', name: 'Booking.com', website: 'https://www.booking.com/', careersUrl: 'https://jobs.booking.com/', headquarters: 'Amsterdam, NL · India: Bengaluru', industry: 'Travel platform', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'expedia-group', name: 'Expedia Group', website: 'https://www.expediagroup.com/', careersUrl: 'https://careers.expediagroup.com/', headquarters: 'Seattle, US · India: Gurugram, Bengaluru', industry: 'Travel platform', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },

  // ---- Global product companies with verified public job-board feeds ----
  { slug: 'stripe', name: 'Stripe', website: 'https://stripe.com/', careersUrl: 'https://stripe.com/jobs', headquarters: 'San Francisco, US · India: Bengaluru', industry: 'Payments infrastructure', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: { provider: 'greenhouse', token: 'stripe', verifiedAt: VERIFIED, jobsAtVerification: 692 }, portal: 'greenhouse' },
  { slug: 'datadog', name: 'Datadog', website: 'https://www.datadoghq.com/', careersUrl: 'https://careers.datadoghq.com/', headquarters: 'New York, US', industry: 'Observability', indiaRelevance: 'international', roleFamilies: ENG_DATA, feed: { provider: 'greenhouse', token: 'datadog', verifiedAt: VERIFIED, jobsAtVerification: 449 }, portal: 'greenhouse' },
  { slug: 'cloudflare', name: 'Cloudflare', website: 'https://www.cloudflare.com/', careersUrl: 'https://www.cloudflare.com/careers/', headquarters: 'San Francisco, US · India: Bengaluru', industry: 'Edge network and security', indiaRelevance: 'moderate', roleFamilies: [...ENG, 'cybersecurity'], feed: { provider: 'greenhouse', token: 'cloudflare', verifiedAt: VERIFIED, jobsAtVerification: 392 }, portal: 'greenhouse' },
  { slug: 'mongodb', name: 'MongoDB', website: 'https://www.mongodb.com/', careersUrl: 'https://www.mongodb.com/company/careers', headquarters: 'New York, US · India: Gurugram, Bengaluru', industry: 'Databases', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: { provider: 'greenhouse', token: 'mongodb', verifiedAt: VERIFIED, jobsAtVerification: 402 }, portal: 'greenhouse' },
  { slug: 'confluent', name: 'Confluent', website: 'https://www.confluent.io/', careersUrl: 'https://www.confluent.io/careers/', headquarters: 'Mountain View, US · India: Bengaluru', industry: 'Data streaming', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: { provider: 'ashby', token: 'confluent', verifiedAt: VERIFIED, jobsAtVerification: 20 }, portal: 'ashby' },
  { slug: 'snowflake', name: 'Snowflake', website: 'https://www.snowflake.com/', careersUrl: 'https://careers.snowflake.com/', headquarters: 'Bozeman, US · India: Pune, Bengaluru', industry: 'Data cloud', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: { provider: 'ashby', token: 'snowflake', verifiedAt: VERIFIED, jobsAtVerification: 351 }, portal: 'ashby' },
  { slug: 'elastic', name: 'Elastic', website: 'https://www.elastic.co/', careersUrl: 'https://www.elastic.co/careers', headquarters: 'Distributed · India: Bengaluru', industry: 'Search and observability', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: { provider: 'greenhouse', token: 'elastic', verifiedAt: VERIFIED, jobsAtVerification: 385 }, portal: 'greenhouse' },
  { slug: 'gitlab', name: 'GitLab', website: 'https://about.gitlab.com/', careersUrl: 'https://about.gitlab.com/jobs/', headquarters: 'Remote-first', industry: 'DevSecOps platform', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: { provider: 'greenhouse', token: 'gitlab', verifiedAt: VERIFIED, jobsAtVerification: 201 }, portal: 'greenhouse', notes: 'Remote roles are often region-restricted; eligibility is read from each listing.' },
  { slug: 'twilio', name: 'Twilio', website: 'https://www.twilio.com/', careersUrl: 'https://www.twilio.com/en-us/company/jobs', headquarters: 'San Francisco, US · India: Bengaluru', industry: 'Communications APIs', indiaRelevance: 'moderate', roleFamilies: ENG_DATA, feed: { provider: 'greenhouse', token: 'twilio', verifiedAt: VERIFIED, jobsAtVerification: 136 }, portal: 'greenhouse' },
  { slug: 'okta', name: 'Okta', website: 'https://www.okta.com/', careersUrl: 'https://www.okta.com/company/careers/', headquarters: 'San Francisco, US · India: Bengaluru', industry: 'Identity', indiaRelevance: 'moderate', roleFamilies: [...ENG, 'cybersecurity'], feed: { provider: 'greenhouse', token: 'okta', verifiedAt: VERIFIED, jobsAtVerification: 330 }, portal: 'greenhouse' },
  { slug: 'rubrik', name: 'Rubrik', website: 'https://www.rubrik.com/', careersUrl: 'https://www.rubrik.com/company/careers', headquarters: 'Palo Alto, US · India: Bengaluru', industry: 'Data security', indiaRelevance: 'strong', roleFamilies: [...ENG, 'cybersecurity'], feed: { provider: 'greenhouse', token: 'rubrik', verifiedAt: VERIFIED, jobsAtVerification: 141 }, portal: 'greenhouse' },
  { slug: 'druva', name: 'Druva', website: 'https://www.druva.com/', careersUrl: 'https://www.druva.com/about/careers/', headquarters: 'Santa Clara, US · India: Pune', industry: 'Data protection', indiaRelevance: 'strong', roleFamilies: ENG, feed: { provider: 'greenhouse', token: 'druva', verifiedAt: VERIFIED, jobsAtVerification: 35 }, portal: 'greenhouse' },
  { slug: 'inmobi', name: 'InMobi', website: 'https://www.inmobi.com/', careersUrl: 'https://www.inmobi.com/company/careers', headquarters: 'Bengaluru, India', industry: 'Advertising technology', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: { provider: 'greenhouse', token: 'inmobi', verifiedAt: VERIFIED, jobsAtVerification: 70 }, portal: 'greenhouse' },

  // ---- Indian product companies ----
  { slug: 'flipkart', name: 'Flipkart', website: 'https://www.flipkart.com/', careersUrl: 'https://www.flipkartcareers.com/', headquarters: 'Bengaluru, India', industry: 'E-commerce', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'phonepe', name: 'PhonePe', website: 'https://www.phonepe.com/', careersUrl: 'https://www.phonepe.com/careers/', headquarters: 'Bengaluru, India', industry: 'Payments', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'razorpay', name: 'Razorpay', website: 'https://razorpay.com/', careersUrl: 'https://razorpay.com/jobs/', headquarters: 'Bengaluru, India', industry: 'Payments', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'paytm', name: 'Paytm', website: 'https://paytm.com/', careersUrl: 'https://paytm.com/careers/', headquarters: 'Noida, India', industry: 'Payments and fintech', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: { provider: 'lever', token: 'paytm', verifiedAt: VERIFIED, jobsAtVerification: 1, note: 'Probe fetched one posting (limit=1); feed confirmed as Paytm.' }, portal: 'lever' },
  { slug: 'meesho', name: 'Meesho', website: 'https://www.meesho.com/', careersUrl: 'https://www.meesho.io/jobs', headquarters: 'Bengaluru, India', industry: 'E-commerce', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: { provider: 'lever', token: 'meesho', verifiedAt: VERIFIED, jobsAtVerification: 1, note: 'Probe fetched one posting (limit=1); feed confirmed as Meesho.' }, portal: 'lever' },
  { slug: 'swiggy', name: 'Swiggy', website: 'https://www.swiggy.com/', careersUrl: 'https://careers.swiggy.com/', headquarters: 'Bengaluru, India', industry: 'Food delivery', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'zomato', name: 'Zomato', website: 'https://www.zomato.com/', careersUrl: 'https://www.zomato.com/careers', headquarters: 'Gurugram, India', industry: 'Food delivery', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'freshworks', name: 'Freshworks', website: 'https://www.freshworks.com/', careersUrl: 'https://www.freshworks.com/company/careers/', headquarters: 'Chennai, India · San Mateo, US', industry: 'Business software', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: { provider: 'lever', token: 'freshworks', verifiedAt: VERIFIED, jobsAtVerification: 0, note: 'Feed answers but listed zero postings at verification; ingestion runs will report 0 fetched until it is populated.' }, portal: 'lever' },
  { slug: 'zoho', name: 'Zoho', website: 'https://www.zoho.com/', careersUrl: 'https://www.zoho.com/careers.html', headquarters: 'Chennai, India', industry: 'Business software', indiaRelevance: 'strong', roleFamilies: ENG, feed: null, portal: 'careers-site' },
  { slug: 'browserstack', name: 'BrowserStack', website: 'https://www.browserstack.com/', careersUrl: 'https://www.browserstack.com/careers', headquarters: 'Mumbai, India', industry: 'Testing platform', indiaRelevance: 'strong', roleFamilies: ENG, feed: null, portal: 'careers-site' },
  { slug: 'postman', name: 'Postman', website: 'https://www.postman.com/', careersUrl: 'https://www.postman.com/company/careers/', headquarters: 'San Francisco, US · Bengaluru, India', industry: 'API platform', indiaRelevance: 'strong', roleFamilies: ENG, feed: null, portal: 'careers-site' },
  { slug: 'chargebee', name: 'Chargebee', website: 'https://www.chargebee.com/', careersUrl: 'https://www.chargebee.com/careers/', headquarters: 'Chennai, India · San Francisco, US', industry: 'Subscription billing', indiaRelevance: 'strong', roleFamilies: ENG, feed: null, portal: 'careers-site' },
  { slug: 'whatfix', name: 'Whatfix', website: 'https://whatfix.com/', careersUrl: 'https://whatfix.com/careers/', headquarters: 'Bengaluru, India', industry: 'Digital adoption', indiaRelevance: 'strong', roleFamilies: ENG, feed: null, portal: 'careers-site' },
  { slug: 'hasura', name: 'Hasura', website: 'https://hasura.io/', careersUrl: 'https://hasura.io/careers', headquarters: 'San Francisco, US · Bengaluru, India', industry: 'GraphQL and data APIs', indiaRelevance: 'strong', roleFamilies: ENG, feed: null, portal: 'careers-site' },
  { slug: 'dream11', name: 'Dream11 (Dream Sports)', website: 'https://www.dream11.com/', careersUrl: 'https://www.dreamsports.group/careers', headquarters: 'Mumbai, India', industry: 'Fantasy sports', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'myntra', name: 'Myntra', website: 'https://www.myntra.com/', careersUrl: 'https://careers.myntra.com/', headquarters: 'Bengaluru, India', industry: 'Fashion e-commerce', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'cred', name: 'CRED', website: 'https://cred.club/', careersUrl: 'https://careers.cred.club/', headquarters: 'Bengaluru, India', industry: 'Fintech', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: { provider: 'lever', token: 'cred', verifiedAt: VERIFIED, jobsAtVerification: 1, note: 'Probe fetched one posting (limit=1); Bengaluru/Chennai postings confirmed as CRED.' }, portal: 'lever' },
  { slug: 'groww', name: 'Groww', website: 'https://groww.in/', careersUrl: 'https://groww.in/careers', headquarters: 'Bengaluru, India', industry: 'Investing platform', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: { provider: 'greenhouse', token: 'groww', verifiedAt: VERIFIED, jobsAtVerification: 7, note: 'EU-hosted Greenhouse board; listings are Bengaluru.' }, portal: 'greenhouse' },
  { slug: 'zerodha', name: 'Zerodha', website: 'https://zerodha.com/', careersUrl: 'https://zerodha.com/careers/', headquarters: 'Bengaluru, India', industry: 'Broking', indiaRelevance: 'strong', roleFamilies: ENG, feed: null, portal: 'careers-site' },
  { slug: 'juspay', name: 'Juspay', website: 'https://juspay.io/', careersUrl: 'https://juspay.io/careers', headquarters: 'Bengaluru, India', industry: 'Payments infrastructure', indiaRelevance: 'strong', roleFamilies: ENG, feed: null, portal: 'careers-site' },
  { slug: 'clear', name: 'Clear (ClearTax)', website: 'https://clear.in/', careersUrl: 'https://clear.in/s/careers', headquarters: 'Bengaluru, India', industry: 'Tax and finance software', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site', notes: 'The public Greenhouse board named "clear" belongs to CLEAR (US identity company) and was deliberately not linked.' },
  { slug: 'mindtickle', name: 'Mindtickle', website: 'https://www.mindtickle.com/', careersUrl: 'https://www.mindtickle.com/careers/', headquarters: 'Pune, India · San Francisco, US', industry: 'Sales enablement', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: { provider: 'lever', token: 'mindtickle', verifiedAt: VERIFIED, jobsAtVerification: 1, note: 'Probe fetched one posting (limit=1); Pune postings confirmed as Mindtickle.' }, portal: 'lever' },
  { slug: 'darwinbox', name: 'Darwinbox', website: 'https://darwinbox.com/', careersUrl: 'https://darwinbox.com/careers', headquarters: 'Hyderabad, India', industry: 'HR technology', indiaRelevance: 'strong', roleFamilies: ENG, feed: null, portal: 'careers-site' },
  { slug: 'sharechat', name: 'ShareChat', website: 'https://sharechat.com/', careersUrl: 'https://sharechat.com/careers', headquarters: 'Bengaluru, India', industry: 'Social media', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'ola', name: 'Ola', website: 'https://www.olacabs.com/', careersUrl: 'https://www.olacabs.com/careers', headquarters: 'Bengaluru, India', industry: 'Mobility', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
  { slug: 'makemytrip', name: 'MakeMyTrip', website: 'https://www.makemytrip.com/', careersUrl: 'https://careers.makemytrip.com/', headquarters: 'Gurugram, India', industry: 'Travel', indiaRelevance: 'strong', roleFamilies: ENG_DATA, feed: null, portal: 'careers-site' },
]

export const catalogBySlug = (slug: string): CatalogCompany | undefined => COMPANY_CATALOG.find((c) => c.slug === slug)
export const CATALOG_SOURCE_SLUG = (slug: string) => `catalog-${slug}`
