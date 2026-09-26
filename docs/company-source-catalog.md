# Company source catalog

Generated from `src/data/companyCatalog.ts` on 2026-09-25. 60 companies; 19 with a public, documented job-board feed that answered a read-only identity probe on 2026-09-25; 41 with an official careers portal only (stored as **Not configured / Unsupported**, careers link kept).

Rules: only official feeds (Greenhouse Job Board API, Lever Postings API, Ashby Job Board API) are ingested; no scraping, no anti-bot bypass, no LinkedIn or Google Jobs, no third-party copies, no fabricated openings. Ingestion keeps only listings that normalise to a supported JobAppy role family; HR, sales, legal, warehouse and operations roles are dropped as irrelevant.

| Company | HQ / India presence | India relevance | Role families | Source | Status at catalog time |
|---|---|---|---|---|---|
| Microsoft | Redmond, US · India: Hyderabad, Bengaluru, Noida | strong | 14 families | [careers page](https://careers.microsoft.com/) | Not configured (no public feed) |
| Google | Mountain View, US · India: Bengaluru, Hyderabad, Pune | strong | 14 families | [careers page](https://www.google.com/about/careers/applications/) | Not configured (no public feed) |
| Amazon | Seattle, US · India: Bengaluru, Hyderabad, Chennai | strong | 14 families | [careers page](https://www.amazon.jobs/) | Not configured (no public feed) |
| Adobe | San Jose, US · India: Noida, Bengaluru | strong | 8 families | [careers page](https://careers.adobe.com/) | Not configured (no public feed) |
| Atlassian | Sydney, AU · India: Bengaluru | strong | 8 families | [careers page](https://www.atlassian.com/company/careers) | Not configured (no public feed) |
| Salesforce | San Francisco, US · India: Hyderabad, Bengaluru | strong | 8 families | [careers page](https://careers.salesforce.com/) | Not configured (no public feed) |
| Oracle | Austin, US · India: Bengaluru, Hyderabad | strong | 8 families | [careers page](https://www.oracle.com/careers/) | Not configured (no public feed) |
| SAP | Walldorf, DE · India: Bengaluru | strong | 8 families | [careers page](https://jobs.sap.com/) | Not configured (no public feed) |
| ServiceNow | Santa Clara, US · India: Hyderabad | strong | 8 families | [careers page](https://careers.servicenow.com/) | Not configured (no public feed) |
| Intuit | Mountain View, US · India: Bengaluru | strong | 8 families | [careers page](https://www.intuit.com/careers/) | Not configured (no public feed) |
| Cisco | San Jose, US · India: Bengaluru | strong | 6 families | [careers page](https://jobs.cisco.com/) | Not configured (no public feed) |
| NVIDIA | Santa Clara, US · India: Bengaluru, Pune, Hyderabad | strong | 6 families | [careers page](https://www.nvidia.com/en-in/about-nvidia/careers/) | Not configured (no public feed) |
| AMD | Santa Clara, US · India: Bengaluru, Hyderabad | strong | 6 families | [careers page](https://careers.amd.com/) | Not configured (no public feed) |
| Qualcomm | San Diego, US · India: Hyderabad, Bengaluru, Chennai | strong | 6 families | [careers page](https://careers.qualcomm.com/) | Not configured (no public feed) |
| Uber | San Francisco, US · India: Bengaluru, Hyderabad | strong | 8 families | [careers page](https://www.uber.com/us/en/careers/) | Not configured (no public feed) |
| Walmart Global Tech | Bentonville, US · India: Bengaluru, Chennai | strong | 8 families | [careers page](https://careers.walmart.com/) | Not configured (no public feed) |
| PayPal | San Jose, US · India: Bengaluru, Chennai, Hyderabad | strong | 8 families | [careers page](https://www.paypal.com/us/webapps/mpp/jobs) | Not configured (no public feed) |
| Autodesk | San Francisco, US · India: Bengaluru, Pune | moderate | 8 families | [careers page](https://www.autodesk.com/careers) | Not configured (no public feed) |
| Palo Alto Networks | Santa Clara, US · India: Bengaluru | moderate | 6 families | [careers page](https://jobs.paloaltonetworks.com/) | Not configured (no public feed) |
| Booking.com | Amsterdam, NL · India: Bengaluru | moderate | 8 families | [careers page](https://jobs.booking.com/) | Not configured (no public feed) |
| Expedia Group | Seattle, US · India: Gurugram, Bengaluru | moderate | 8 families | [careers page](https://careers.expediagroup.com/) | Not configured (no public feed) |
| Stripe | San Francisco, US · India: Bengaluru | moderate | 8 families | greenhouse `stripe` (verified 2026-09-25, 692 listings) | Configured (verified feed) |
| Datadog | New York, US | international | 8 families | greenhouse `datadog` (verified 2026-09-25, 449 listings) | Configured (verified feed) |
| Cloudflare | San Francisco, US · India: Bengaluru | moderate | 6 families | greenhouse `cloudflare` (verified 2026-09-25, 392 listings) | Configured (verified feed) |
| MongoDB | New York, US · India: Gurugram, Bengaluru | moderate | 8 families | greenhouse `mongodb` (verified 2026-09-25, 402 listings) | Configured (verified feed) |
| Confluent | Mountain View, US · India: Bengaluru | moderate | 8 families | ashby `confluent` (verified 2026-09-25, 20 listings) | Configured (verified feed) |
| Snowflake | Bozeman, US · India: Pune, Bengaluru | moderate | 8 families | ashby `snowflake` (verified 2026-09-25, 351 listings) | Configured (verified feed) |
| Elastic | Distributed · India: Bengaluru | moderate | 8 families | greenhouse `elastic` (verified 2026-09-25, 385 listings) | Configured (verified feed) |
| GitLab | Remote-first | moderate | 8 families | greenhouse `gitlab` (verified 2026-09-25, 201 listings) | Configured (verified feed) |
| Twilio | San Francisco, US · India: Bengaluru | moderate | 8 families | greenhouse `twilio` (verified 2026-09-25, 136 listings) | Configured (verified feed) |
| Okta | San Francisco, US · India: Bengaluru | moderate | 6 families | greenhouse `okta` (verified 2026-09-25, 330 listings) | Configured (verified feed) |
| Rubrik | Palo Alto, US · India: Bengaluru | strong | 6 families | greenhouse `rubrik` (verified 2026-09-25, 141 listings) | Configured (verified feed) |
| Druva | Santa Clara, US · India: Pune | strong | 5 families | greenhouse `druva` (verified 2026-09-25, 35 listings) | Configured (verified feed) |
| InMobi | Bengaluru, India | strong | 8 families | greenhouse `inmobi` (verified 2026-09-25, 70 listings) | Configured (verified feed) |
| Flipkart | Bengaluru, India | strong | 8 families | [careers page](https://www.flipkartcareers.com/) | Not configured (no public feed) |
| PhonePe | Bengaluru, India | strong | 8 families | [careers page](https://www.phonepe.com/careers/) | Not configured (no public feed) |
| Razorpay | Bengaluru, India | strong | 8 families | [careers page](https://razorpay.com/jobs/) | Not configured (no public feed) |
| Paytm | Noida, India | strong | 8 families | lever `paytm` (verified 2026-09-25, 1 listings) | Configured (verified feed) |
| Meesho | Bengaluru, India | strong | 8 families | lever `meesho` (verified 2026-09-25, 1 listings) | Configured (verified feed) |
| Swiggy | Bengaluru, India | strong | 8 families | [careers page](https://careers.swiggy.com/) | Not configured (no public feed) |
| Zomato | Gurugram, India | strong | 8 families | [careers page](https://www.zomato.com/careers) | Not configured (no public feed) |
| Freshworks | Chennai, India · San Mateo, US | strong | 8 families | lever `freshworks` (verified 2026-09-25, 0 listings) | Configured (verified feed) |
| Zoho | Chennai, India | strong | 5 families | [careers page](https://www.zoho.com/careers.html) | Not configured (no public feed) |
| BrowserStack | Mumbai, India | strong | 5 families | [careers page](https://www.browserstack.com/careers) | Not configured (no public feed) |
| Postman | San Francisco, US · Bengaluru, India | strong | 5 families | [careers page](https://www.postman.com/company/careers/) | Not configured (no public feed) |
| Chargebee | Chennai, India · San Francisco, US | strong | 5 families | [careers page](https://www.chargebee.com/careers/) | Not configured (no public feed) |
| Whatfix | Bengaluru, India | strong | 5 families | [careers page](https://whatfix.com/careers/) | Not configured (no public feed) |
| Hasura | San Francisco, US · Bengaluru, India | strong | 5 families | [careers page](https://hasura.io/careers) | Not configured (no public feed) |
| Dream11 (Dream Sports) | Mumbai, India | strong | 8 families | [careers page](https://www.dreamsports.group/careers) | Not configured (no public feed) |
| Myntra | Bengaluru, India | strong | 8 families | [careers page](https://careers.myntra.com/) | Not configured (no public feed) |
| CRED | Bengaluru, India | strong | 8 families | lever `cred` (verified 2026-09-25, 1 listings) | Configured (verified feed) |
| Groww | Bengaluru, India | strong | 8 families | greenhouse `groww` (verified 2026-09-25, 7 listings) | Configured (verified feed) |
| Zerodha | Bengaluru, India | strong | 5 families | [careers page](https://zerodha.com/careers/) | Not configured (no public feed) |
| Juspay | Bengaluru, India | strong | 5 families | [careers page](https://juspay.io/careers) | Not configured (no public feed) |
| Clear (ClearTax) | Bengaluru, India | strong | 8 families | [careers page](https://clear.in/careers) | Not configured (no public feed) |
| Mindtickle | Pune, India · San Francisco, US | strong | 8 families | lever `mindtickle` (verified 2026-09-25, 1 listings) | Configured (verified feed) |
| Darwinbox | Hyderabad, India | strong | 5 families | [careers page](https://darwinbox.com/careers) | Not configured (no public feed) |
| ShareChat | Bengaluru, India | strong | 8 families | [careers page](https://sharechat.com/careers) | Not configured (no public feed) |
| Ola | Bengaluru, India | strong | 8 families | [careers page](https://www.olacabs.com/careers) | Not configured (no public feed) |
| MakeMyTrip | Gurugram, India | strong | 8 families | [careers page](https://careers.makemytrip.com/) | Not configured (no public feed) |

## Notes

- **GitLab**: Remote roles are often region-restricted; eligibility is read from each listing.
- **Paytm**: Probe fetched one posting (limit=1); feed confirmed as Paytm.
- **Meesho**: Probe fetched one posting (limit=1); feed confirmed as Meesho.
- **Freshworks**: Feed answers but listed zero postings at verification; ingestion runs will report 0 fetched until it is populated.
- **CRED**: Probe fetched one posting (limit=1); Bengaluru/Chennai postings confirmed as CRED.
- **Groww**: EU-hosted Greenhouse board; listings are Bengaluru.
- **Clear (ClearTax)**: The public Greenhouse board named "clear" belongs to CLEAR (US identity company) and was deliberately not linked.
- **Mindtickle**: Probe fetched one posting (limit=1); Pune postings confirmed as Mindtickle.

Live status (Healthy / Degraded / last run / live jobs) is shown in `/admin/catalog`; `Verify feeds` re-probes every configured feed read-only and `Run verified sources` ingests them through the existing scheduler-safe engine.
