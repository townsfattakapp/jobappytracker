# Company source catalog

Generated from `src/data/companyCatalog.ts` on 2026-09-27 by `scripts/docs-company-catalog.mjs`. 188 companies: 130 with a public, documented job-board feed (Greenhouse, Lever, Ashby, SmartRecruiters), 30 read through the JSON endpoint their own careers site calls (Amazon Jobs, Eightfold, Workday, Oracle Cloud HCM, Atlassian), 28 with an official careers portal only (stored as **Not configured / Unsupported**, careers link kept). Read-only identity probes ran on 2026-09-25, 2026-09-26, 2026-09-27.

Rules: documented board APIs and the careers sites' own JSON endpoints are read the way a browser would, with their page sizes, a cap per run and retries on rate limits; no HTML scraping, no anti-bot bypass, no LinkedIn or Google Jobs, no third-party copies, no fabricated openings. The site endpoints (Amazon, Eightfold, Workday) are unofficial and undocumented: a change on their side shows up as a failed run on /admin/catalog, never as invented data. Google, Meta and Apple offer neither a feed nor a readable endpoint and stay careers-link only. Ingestion keeps only listings that normalise to a supported JobAppy role family; HR, sales, legal, warehouse and operations roles are dropped as irrelevant.

| Company | HQ / India presence | India relevance | Role families | Source | Status at catalog time |
|---|---|---|---|---|---|
| Microsoft | Redmond, US · India: Hyderabad, Bengaluru, Noida | strong | 14 families | eightfold site JSON (unofficial) `apply.careers.microsoft.com|microsoft.com|pcsx` (verified 2026-09-27, 807 listings) | Configured (verified feed) |
| Google | Mountain View, US · India: Bengaluru, Hyderabad, Pune | strong | 14 families | [careers page](https://www.google.com/about/careers/applications/) | Not configured (no public feed) · Google Careers renders listings as HTML only (its former public jobs API answers 404); no JSON feed to read, so the careers link is kept. |
| Amazon | Seattle, US · India: Bengaluru, Hyderabad, Chennai | strong | 14 families | amazon site JSON (unofficial) `amazon.jobs` (verified 2026-09-27, 401 listings) | Configured (verified feed) |
| Adobe | San Jose, US · India: Noida, Bengaluru | strong | 8 families | workday site JSON (unofficial) `adobe.wd5.myworkdayjobs.com/adobe/external_experienced` (verified 2026-09-27, 566 listings) | Configured (verified feed) |
| Atlassian | Sydney, AU · India: Bengaluru | strong | 8 families | atlassian site JSON (unofficial) `atlassian.com` (verified 2026-09-27, 289 listings) | Configured (verified feed) |
| Salesforce | San Francisco, US · India: Hyderabad, Bengaluru | strong | 8 families | workday site JSON (unofficial) `salesforce.wd12.myworkdayjobs.com/salesforce/External_Career_Site` (verified 2026-09-27, 1522 listings) | Configured (verified feed) |
| Oracle | Austin, US · India: Bengaluru, Hyderabad | strong | 8 families | oraclecloud site JSON (unofficial) `eeho.fa.us2.oraclecloud.com/CX_1` (verified 2026-09-27, 2221 listings) | Configured (verified feed) |
| SAP | Walldorf, DE · India: Bengaluru | strong | 8 families | [careers page](https://jobs.sap.com/) | Not configured (no public feed) |
| ServiceNow | Santa Clara, US · India: Hyderabad | strong | 8 families | smartrecruiters board `servicenow` (verified 2026-09-27, 702 listings) | Configured (verified feed) |
| Intuit | Mountain View, US · India: Bengaluru | strong | 8 families | [careers page](https://www.intuit.com/careers/) | Not configured (no public feed) |
| Cisco | San Jose, US · India: Bengaluru | strong | 6 families | workday site JSON (unofficial) `cisco.wd5.myworkdayjobs.com/cisco/Cisco_Careers` (verified 2026-09-27, 1327 listings) | Configured (verified feed) |
| NVIDIA | Santa Clara, US · India: Bengaluru, Pune, Hyderabad | strong | 6 families | workday site JSON (unofficial) `nvidia.wd5.myworkdayjobs.com/nvidia/NVIDIAExternalCareerSite` (verified 2026-09-27, 2000 listings) | Configured (verified feed) |
| AMD | Santa Clara, US · India: Bengaluru, Hyderabad | strong | 6 families | [careers page](https://www.amd.com/en/corporate/careers) | Not configured (no public feed) |
| Qualcomm | San Diego, US · India: Hyderabad, Bengaluru, Chennai | strong | 6 families | eightfold site JSON (unofficial) `qualcomm.eightfold.ai|qualcomm.com|pcsx` (verified 2026-09-27, 596 listings) | Configured (verified feed) |
| Uber | San Francisco, US · India: Bengaluru, Hyderabad | strong | 8 families | [careers page](https://www.uber.com/careers/) | Not configured (no public feed) |
| Walmart Global Tech | Bentonville, US · India: Bengaluru, Chennai | strong | 8 families | [careers page](https://careers.walmart.com/) | Not configured (no public feed) |
| PayPal | San Jose, US · India: Bengaluru, Chennai, Hyderabad | strong | 8 families | workday site JSON (unofficial) `paypal.wd1.myworkdayjobs.com/paypal/jobs` (verified 2026-09-27, 280 listings) | Configured (verified feed) |
| Autodesk | San Francisco, US · India: Bengaluru, Pune | moderate | 8 families | workday site JSON (unofficial) `autodesk.wd1.myworkdayjobs.com/autodesk/Ext` (verified 2026-09-27, 389 listings) | Configured (verified feed) |
| Palo Alto Networks | Santa Clara, US · India: Bengaluru | moderate | 6 families | workday site JSON (unofficial) `paloaltonetworks.wd5.myworkdayjobs.com/paloaltonetworks/panwexternalcareers` (verified 2026-09-27, 1508 listings) | Configured (verified feed) |
| Booking.com | Amsterdam, NL · India: Bengaluru | moderate | 8 families | [careers page](https://jobs.booking.com/) | Not configured (no public feed) |
| Expedia Group | Seattle, US · India: Gurugram, Bengaluru | moderate | 8 families | workday site JSON (unofficial) `expedia.wd108.myworkdayjobs.com/expedia/search` (verified 2026-09-27, 7 listings) | Configured (verified feed) |
| Stripe | San Francisco, US · India: Bengaluru | moderate | 8 families | greenhouse board `stripe` (verified 2026-09-25, 692 listings) | Configured (verified feed) |
| Datadog | New York, US | international | 8 families | greenhouse board `datadog` (verified 2026-09-25, 449 listings) | Configured (verified feed) |
| Cloudflare | San Francisco, US · India: Bengaluru | moderate | 6 families | greenhouse board `cloudflare` (verified 2026-09-25, 392 listings) | Configured (verified feed) |
| MongoDB | New York, US · India: Gurugram, Bengaluru | moderate | 8 families | greenhouse board `mongodb` (verified 2026-09-25, 402 listings) | Configured (verified feed) |
| Confluent | Mountain View, US · India: Bengaluru | moderate | 8 families | ashby board `confluent` (verified 2026-09-25, 20 listings) | Configured (verified feed) |
| Snowflake | Bozeman, US · India: Pune, Bengaluru | moderate | 8 families | ashby board `snowflake` (verified 2026-09-25, 351 listings) | Configured (verified feed) |
| Elastic | Distributed · India: Bengaluru | moderate | 8 families | greenhouse board `elastic` (verified 2026-09-25, 385 listings) | Configured (verified feed) |
| GitLab | Remote-first | moderate | 8 families | greenhouse board `gitlab` (verified 2026-09-25, 201 listings) | Configured (verified feed) · Remote roles are often region-restricted; eligibility is read from each listing. |
| Twilio | San Francisco, US · India: Bengaluru | moderate | 8 families | greenhouse board `twilio` (verified 2026-09-25, 136 listings) | Configured (verified feed) |
| Okta | San Francisco, US · India: Bengaluru | moderate | 6 families | greenhouse board `okta` (verified 2026-09-25, 330 listings) | Configured (verified feed) |
| Rubrik | Palo Alto, US · India: Bengaluru | strong | 6 families | greenhouse board `rubrik` (verified 2026-09-25, 141 listings) | Configured (verified feed) |
| Druva | Santa Clara, US · India: Pune | strong | 5 families | greenhouse board `druva` (verified 2026-09-25, 35 listings) | Configured (verified feed) |
| InMobi | Bengaluru, India | strong | 8 families | greenhouse board `inmobi` (verified 2026-09-25, 70 listings) | Configured (verified feed) |
| Flipkart | Bengaluru, India | strong | 8 families | [careers page](https://www.flipkartcareers.com/) | Not configured (no public feed) |
| PhonePe | Bengaluru, India | strong | 8 families | [careers page](https://www.phonepe.com/careers/) | Not configured (no public feed) |
| Razorpay | Bengaluru, India | strong | 8 families | greenhouse board `razorpaysoftwareprivatelimited` (verified 2026-09-27, 25 listings) | Configured (verified feed) |
| Paytm | Noida, India | strong | 8 families | lever board `paytm` (verified 2026-09-25, 1 listings) | Configured (verified feed) |
| Meesho | Bengaluru, India | strong | 8 families | lever board `meesho` (verified 2026-09-25, 1 listings) | Configured (verified feed) |
| Swiggy | Bengaluru, India | strong | 8 families | smartrecruiters board `swiggy` (verified 2026-09-27, 131 listings) | Configured (verified feed) |
| Zomato | Gurugram, India | strong | 8 families | [careers page](https://www.zomato.com/careers) | Not configured (no public feed) · The Lever site "eternal" belongs to a different company, not the Zomato parent; zomato.com/careers is HTML only. |
| Freshworks | Chennai, India · San Mateo, US | strong | 8 families | smartrecruiters board `Freshworks` (verified 2026-09-27, 125 listings) | Configured (verified feed) |
| Zoho | Chennai, India | strong | 5 families | [careers page](https://www.zoho.com/careers.html) | Not configured (no public feed) |
| BrowserStack | Mumbai, India | strong | 5 families | workday site JSON (unofficial) `browserstack.wd3.myworkdayjobs.com/browserstack/External` (verified 2026-09-27, 35 listings) | Configured (verified feed) |
| Postman | San Francisco, US · Bengaluru, India | strong | 5 families | [careers page](https://www.postman.com/company/careers/) | Not configured (no public feed) |
| Chargebee | Chennai, India · San Francisco, US | strong | 5 families | [careers page](https://www.chargebee.com/careers/) | Not configured (no public feed) |
| Whatfix | Bengaluru, India | strong | 5 families | [careers page](https://whatfix.com/careers/) | Not configured (no public feed) |
| Hasura | San Francisco, US · Bengaluru, India | strong | 5 families | [careers page](https://hasura.io/careers) | Not configured (no public feed) |
| Dream11 (Dream Sports) | Mumbai, India | strong | 8 families | [careers page](https://www.dreamsports.group/careers) | Not configured (no public feed) · dreamsports.group links to jobs.lever.co/dreamsports, which answers 404; no feed to read. |
| Myntra | Bengaluru, India | strong | 8 families | [careers page](https://careers.myntra.com/) | Not configured (no public feed) |
| CRED | Bengaluru, India | strong | 8 families | lever board `cred` (verified 2026-09-25, 1 listings) | Configured (verified feed) |
| Groww | Bengaluru, India | strong | 8 families | greenhouse board `groww` (verified 2026-09-25, 7 listings) | Configured (verified feed) |
| Zerodha | Bengaluru, India | strong | 5 families | [careers page](https://zerodha.com/careers/) | Not configured (no public feed) |
| Juspay | Bengaluru, India | strong | 5 families | [careers page](https://juspay.io/careers) | Not configured (no public feed) |
| Clear (ClearTax) | Bengaluru, India | strong | 8 families | [careers page](https://clear.in/s/careers) | Not configured (no public feed) · The public Greenhouse board named "clear" belongs to CLEAR (US identity company) and was deliberately not linked. |
| Mindtickle | Pune, India · San Francisco, US | strong | 8 families | lever board `mindtickle` (verified 2026-09-26, 18 listings) | Configured (verified feed) |
| Darwinbox | Hyderabad, India | strong | 5 families | [careers page](https://darwinbox.com/careers) | Not configured (no public feed) |
| ShareChat | Bengaluru, India | strong | 8 families | [careers page](https://sharechat.com/careers) | Not configured (no public feed) |
| Ola | Bengaluru, India | strong | 8 families | [careers page](https://www.olacabs.com/careers) | Not configured (no public feed) |
| MakeMyTrip | Gurugram, India | strong | 8 families | [careers page](https://careers.makemytrip.com/) | Not configured (no public feed) |
| Meta | Menlo Park, US · India: Bengaluru, Hyderabad, Gurugram | strong | 14 families | [careers page](https://www.metacareers.com/jobs) | Not configured (no public feed) · Meta Careers rejects requests that do not come from its own page (HTTP 400); nothing is bypassed, so the careers link is kept. |
| Apple | Cupertino, US · India: Bengaluru, Hyderabad | strong | 6 families | [careers page](https://jobs.apple.com/en-in/search) | Not configured (no public feed) · Apple Jobs exposes no JSON endpoint that could be read without emulating its page; the careers link is kept. |
| Netflix | Los Gatos, US · India: Mumbai | moderate | 8 families | eightfold site JSON (unofficial) `explore.jobs.netflix.net|netflix.com|apply-v2` (verified 2026-09-27, 484 listings) | Configured (verified feed) |
| LinkedIn | Sunnyvale, US · India: Bengaluru | strong | 8 families | [careers page](https://careers.linkedin.com/) | Not configured (no public feed) · The Greenhouse board named "linkedin" is a test board with placeholder titles, not the LinkedIn careers site; careers.linkedin.com is HTML only. |
| Goldman Sachs Engineering | New York, US · India: Bengaluru, Hyderabad | strong | 8 families | [careers page](https://www.goldmansachs.com/careers/) | Not configured (no public feed) |
| JPMorgan Chase Technology | New York, US · India: Bengaluru, Mumbai, Hyderabad | strong | 8 families | oraclecloud site JSON (unofficial) `jpmc.fa.oraclecloud.com/CX_1001` (verified 2026-09-27, 7501 listings) | Configured (verified feed) |
| Visa | San Francisco, US · India: Bengaluru | strong | 8 families | workday site JSON (unofficial) `visa.wd5.myworkdayjobs.com/visa/Visa` (verified 2026-09-27, 776 listings) | Configured (verified feed) |
| Mastercard | Purchase, US · India: Pune, Gurugram | strong | 8 families | workday site JSON (unofficial) `mastercard.wd1.myworkdayjobs.com/mastercard/CorporateCareers` (verified 2026-09-27, 1043 listings) | Configured (verified feed) |
| Databricks | San Francisco, US · India: Bengaluru | strong | 8 families | greenhouse board `databricks` (verified 2026-09-26, 888 listings) | Configured (verified feed) |
| OpenAI | San Francisco, US | international | 7 families | ashby board `openai` (verified 2026-09-26, 830 listings) | Configured (verified feed) |
| Anthropic | San Francisco, US | international | 7 families | greenhouse board `anthropic` (verified 2026-09-26, 619 listings) | Configured (verified feed) |
| Airwallex | Melbourne, AU · Singapore | international | 8 families | ashby board `airwallex` (verified 2026-09-26, 578 listings) | Configured (verified feed) |
| DoorDash | San Francisco, US | international | 8 families | greenhouse board `doordashusa` (verified 2026-09-26, 457 listings) | Configured (verified feed) |
| Braze | New York, US | international | 8 families | greenhouse board `braze` (verified 2026-09-26, 325 listings) | Configured (verified feed) |
| Binance | Distributed | international | 8 families | lever board `binance` (verified 2026-09-26, 304 listings) | Configured (verified feed) |
| Brex | San Francisco, US | international | 8 families | greenhouse board `brex` (verified 2026-09-26, 259 listings) | Configured (verified feed) |
| Roblox | San Mateo, US | international | 8 families | greenhouse board `roblox` (verified 2026-09-26, 257 listings) | Configured (verified feed) |
| Samsara | San Francisco, US | international | 8 families | greenhouse board `samsara` (verified 2026-09-26, 248 listings) | Configured (verified feed) |
| Coinbase | Remote-first, US · India: Hyderabad | moderate | 8 families | greenhouse board `coinbase` (verified 2026-09-26, 210 listings) | Configured (verified feed) |
| ElevenLabs | London, UK · New York, US | international | 6 families | ashby board `elevenlabs` (verified 2026-09-26, 207 listings) | Configured (verified feed) |
| Scale AI | San Francisco, US | international | 7 families | greenhouse board `scaleai` (verified 2026-09-26, 203 listings) | Configured (verified feed) |
| Flexport | San Francisco, US | international | 8 families | greenhouse board `flexport` (verified 2026-09-26, 199 listings) | Configured (verified feed) |
| Fivetran | Oakland, US · India: Bengaluru | moderate | 8 families | greenhouse board `fivetran` (verified 2026-09-26, 192 listings) | Configured (verified feed) |
| Affirm | San Francisco, US | international | 8 families | greenhouse board `affirm` (verified 2026-09-26, 180 listings) | Configured (verified feed) |
| Lyft | San Francisco, US | international | 8 families | greenhouse board `lyft` (verified 2026-09-26, 175 listings) | Configured (verified feed) |
| Riot Games | Los Angeles, US | international | 8 families | greenhouse board `riotgames` (verified 2026-09-26, 165 listings) | Configured (verified feed) |
| Figma | San Francisco, US · India: Bengaluru | moderate | 8 families | greenhouse board `figma` (verified 2026-09-26, 163 listings) | Configured (verified feed) |
| Robinhood | Menlo Park, US | international | 8 families | greenhouse board `robinhood` (verified 2026-09-26, 159 listings) | Configured (verified feed) |
| Airbnb | San Francisco, US | international | 8 families | greenhouse board `airbnb` (verified 2026-09-26, 159 listings) | Configured (verified feed) |
| Ramp | New York, US | international | 8 families | ashby board `ramp` (verified 2026-09-26, 158 listings) | Configured (verified feed) |
| Epic Games | Cary, US | international | 5 families | greenhouse board `epicgames` (verified 2026-09-26, 154 listings) | Configured (verified feed) |
| Pinterest | San Francisco, US | international | 8 families | greenhouse board `pinterest` (verified 2026-09-26, 153 listings) | Configured (verified feed) |
| Reddit | San Francisco, US | international | 8 families | greenhouse board `reddit` (verified 2026-09-26, 150 listings) | Configured (verified feed) |
| Deliveroo | London, UK · India: Hyderabad | moderate | 8 families | greenhouse board `deliveroo` (verified 2026-09-26, 150 listings) | Configured (verified feed) |
| Grafana Labs | Remote-first | international | 5 families | greenhouse board `grafanalabs` (verified 2026-09-26, 148 listings) | Configured (verified feed) |
| Cohere | Toronto, CA | international | 6 families | ashby board `cohere` (verified 2026-09-26, 147 listings) | Configured (verified feed) |
| Notion | San Francisco, US | international | 8 families | ashby board `notion` (verified 2026-09-26, 128 listings) | Configured (verified feed) |
| Cursor (Anysphere) | San Francisco, US | international | 6 families | ashby board `cursor` (verified 2026-09-26, 126 listings) | Configured (verified feed) |
| Perplexity | San Francisco, US | international | 6 families | ashby board `perplexity` (verified 2026-09-26, 122 listings) | Configured (verified feed) |
| Plaid | San Francisco, US | international | 8 families | ashby board `plaid` (verified 2026-09-26, 122 listings) | Configured (verified feed) |
| Instacart | San Francisco, US | international | 8 families | greenhouse board `instacart` (verified 2026-09-26, 116 listings) | Configured (verified feed) |
| Intercom | San Francisco, US · Dublin, IE | international | 8 families | greenhouse board `intercom` (verified 2026-09-26, 115 listings) | Configured (verified feed) |
| Baseten | San Francisco, US | international | 6 families | ashby board `baseten` (verified 2026-09-26, 101 listings) | Configured (verified feed) |
| Asana | San Francisco, US | international | 8 families | greenhouse board `asana` (verified 2026-09-26, 97 listings) | Configured (verified feed) |
| Gusto | San Francisco, US | international | 8 families | greenhouse board `gusto` (verified 2026-09-26, 97 listings) | Configured (verified feed) |
| Vercel | San Francisco, US | international | 7 families | greenhouse board `vercel` (verified 2026-09-26, 88 listings) | Configured (verified feed) |
| Vanta | San Francisco, US | international | 6 families | ashby board `vanta` (verified 2026-09-26, 88 listings) | Configured (verified feed) |
| Duolingo | Pittsburgh, US | international | 6 families | greenhouse board `duolingo` (verified 2026-09-26, 82 listings) | Configured (verified feed) |
| Hightouch | San Francisco, US | international | 8 families | greenhouse board `hightouch` (verified 2026-09-26, 82 listings) | Configured (verified feed) |
| Spotify | Stockholm, SE | international | 8 families | lever board `spotify` (verified 2026-09-26, 79 listings) | Configured (verified feed) |
| Carta | San Francisco, US | international | 8 families | greenhouse board `carta` (verified 2026-09-26, 78 listings) | Configured (verified feed) |
| Replit | Foster City, US | international | 5 families | ashby board `replit` (verified 2026-09-26, 75 listings) | Configured (verified feed) |
| Mixpanel | San Francisco, US | international | 8 families | greenhouse board `mixpanel` (verified 2026-09-26, 72 listings) | Configured (verified feed) |
| Monzo | London, UK | international | 8 families | greenhouse board `monzo` (verified 2026-09-26, 71 listings) | Configured (verified feed) |
| Crypto.com | Singapore | international | 8 families | lever board `crypto` (verified 2026-09-26, 70 listings) | Configured (verified feed) |
| N26 | Berlin, DE | international | 8 families | greenhouse board `n26` (verified 2026-09-26, 67 listings) | Configured (verified feed) |
| Chime | San Francisco, US | international | 8 families | greenhouse board `chime` (verified 2026-09-26, 66 listings) | Configured (verified feed) |
| Suno | Cambridge, US | international | 6 families | ashby board `suno` (verified 2026-09-26, 63 listings) | Configured (verified feed) |
| Neo4j | San Mateo, US · Malmö, SE · India: Bengaluru | moderate | 8 families | greenhouse board `neo4j` (verified 2026-09-26, 60 listings) | Configured (verified feed) |
| Twitch | San Francisco, US | international | 8 families | greenhouse board `twitch` (verified 2026-09-26, 59 listings) | Configured (verified feed) |
| Supabase | Remote-first | international | 6 families | ashby board `supabase` (verified 2026-09-26, 56 listings) | Configured (verified feed) |
| LaunchDarkly | Oakland, US · India | moderate | 5 families | greenhouse board `launchdarkly` (verified 2026-09-26, 55 listings) | Configured (verified feed) |
| Peloton | New York, US | international | 6 families | greenhouse board `peloton` (verified 2026-09-26, 54 listings) | Configured (verified feed) |
| New Relic | San Francisco, US · India: Bengaluru, Hyderabad | moderate | 8 families | greenhouse board `newrelic` (verified 2026-09-26, 52 listings) | Configured (verified feed) |
| Tailscale | Toronto, CA | international | 6 families | greenhouse board `tailscale` (verified 2026-09-26, 52 listings) | Configured (verified feed) |
| PagerDuty | San Francisco, US | international | 5 families | greenhouse board `pagerduty` (verified 2026-09-26, 51 listings) | Configured (verified feed) |
| Rho | New York, US | international | 5 families | ashby board `rho` (verified 2026-09-26, 51 listings) | Configured (verified feed) |
| Discord | San Francisco, US | international | 8 families | greenhouse board `discord` (verified 2026-09-26, 49 listings) | Configured (verified feed) |
| Dropbox | Remote-first, US | international | 8 families | greenhouse board `dropbox` (verified 2026-09-26, 44 listings) | Configured (verified feed) |
| SingleStore | San Francisco, US · India: Bengaluru, Hyderabad | moderate | 8 families | greenhouse board `singlestore` (verified 2026-09-26, 42 listings) | Configured (verified feed) |
| Fastly | San Francisco, US | international | 5 families | greenhouse board `fastly` (verified 2026-09-26, 40 listings) | Configured (verified feed) |
| Bitwarden | Santa Barbara, US · India: Noida | moderate | 6 families | greenhouse board `bitwarden` (verified 2026-09-26, 40 listings) | Configured (verified feed) |
| Render | San Francisco, US | international | 5 families | ashby board `render` (verified 2026-09-26, 40 listings) | Configured (verified feed) |
| Drata | San Diego, US | international | 6 families | ashby board `drata` (verified 2026-09-26, 39 listings) | Configured (verified feed) |
| Modal | New York, US | international | 6 families | ashby board `modal` (verified 2026-09-26, 39 listings) | Configured (verified feed) |
| Amplitude | San Francisco, US · India: Bengaluru | moderate | 8 families | greenhouse board `amplitude` (verified 2026-09-26, 38 listings) | Configured (verified feed) |
| Algolia | Paris, FR · San Francisco, US | international | 5 families | greenhouse board `algolia` (verified 2026-09-26, 35 listings) | Configured (verified feed) |
| Squarespace | New York, US | international | 8 families | greenhouse board `squarespace` (verified 2026-09-26, 34 listings) | Configured (verified feed) |
| Linear | San Francisco, US · remote | international | 6 families | ashby board `linear` (verified 2026-09-26, 30 listings) | Configured (verified feed) |
| WorkOS | San Francisco, US | international | 5 families | ashby board `workos` (verified 2026-09-26, 29 listings) | Configured (verified feed) |
| Webflow | San Francisco, US | international | 6 families | greenhouse board `webflow` (verified 2026-09-26, 27 listings) | Configured (verified feed) |
| Oyster | Remote-first | international | 5 families | ashby board `oyster` (verified 2026-09-26, 27 listings) | Configured (verified feed) |
| Anyscale | San Francisco, US · India: Bengaluru | moderate | 6 families | ashby board `anyscale` (verified 2026-09-26, 22 listings) | Configured (verified feed) |
| Warp | New York, US | international | 5 families | ashby board `warp` (verified 2026-09-26, 21 listings) | Configured (verified feed) |
| Contentful | Berlin, DE | international | 5 families | greenhouse board `contentful` (verified 2026-09-26, 20 listings) | Configured (verified feed) |
| Cockroach Labs | New York, US | international | 5 families | greenhouse board `cockroachlabs` (verified 2026-09-26, 19 listings) | Configured (verified feed) |
| Midjourney | San Francisco, US | international | 6 families | ashby board `midjourney` (verified 2026-09-26, 18 listings) | Configured (verified feed) |
| Substack | San Francisco, US | international | 5 families | ashby board `substack` (verified 2026-09-26, 16 listings) | Configured (verified feed) |
| Yugabyte | Sunnyvale, US · India: Bengaluru | moderate | 5 families | greenhouse board `yugabyte` (verified 2026-09-26, 15 listings) | Configured (verified feed) |
| CircleCI | San Francisco, US | international | 5 families | greenhouse board `circleci` (verified 2026-09-26, 14 listings) | Configured (verified feed) |
| Patreon | San Francisco, US | international | 8 families | ashby board `patreon` (verified 2026-09-26, 14 listings) | Configured (verified feed) |
| Mintlify | San Francisco, US | international | 6 families | ashby board `mintlify` (verified 2026-09-26, 14 listings) | Configured (verified feed) |
| Pika | Palo Alto, US | international | 6 families | ashby board `pika` (verified 2026-09-26, 14 listings) | Configured (verified feed) |
| Calendly | Atlanta, US | international | 5 families | greenhouse board `calendly` (verified 2026-09-26, 11 listings) | Configured (verified feed) |
| PlanetScale | San Francisco, US | international | 5 families | greenhouse board `planetscale` (verified 2026-09-26, 11 listings) | Configured (verified feed) |
| Offchain Labs (Arbitrum) | New York, US | international | 5 families | lever board `offchainlabs` (verified 2026-09-26, 11 listings) | Configured (verified feed) |
| Sumo Logic | Redwood City, US · India: Noida, Bengaluru | strong | 8 families | greenhouse board `sumologic` (verified 2026-09-26, 9 listings) | Configured (verified feed) |
| Resend | Remote-first | international | 6 families | ashby board `resend` (verified 2026-09-26, 9 listings) | Configured (verified feed) |
| PostHog | Remote-first | international | 8 families | ashby board `posthog` (verified 2026-09-26, 8 listings) | Configured (verified feed) |
| Railway | Remote-first | international | 5 families | ashby board `railway` (verified 2026-09-26, 8 listings) | Configured (verified feed) |
| Stability AI | London, UK | international | 6 families | greenhouse board `stabilityai` (verified 2026-09-26, 6 listings) | Configured (verified feed) |
| Netlify | San Francisco, US | international | 6 families | greenhouse board `netlify` (verified 2026-09-26, 4 listings) | Configured (verified feed) |
| Runway | New York, US | international | 6 families | ashby board `runway` (verified 2026-09-26, 4 listings) | Configured (verified feed) |
| Airtable | San Francisco, US | international | 5 families | greenhouse board `airtable` (verified 2026-09-26, 3 listings) | Configured (verified feed) |
| Clerk | San Francisco, US · remote | international | 6 families | ashby board `clerk` (verified 2026-09-26, 2 listings) | Configured (verified feed) |
| Zeta | Bengaluru, India | strong | 8 families | lever board `zeta` (verified 2026-09-26, 22 listings) | Configured (verified feed) |
| Atlan | Bengaluru, India · Singapore | strong | 8 families | ashby board `atlan` (verified 2026-09-26, 8 listings) | Configured (verified feed) |
| Observe.AI | Bengaluru, India · Redwood City, US | strong | 7 families | greenhouse board `observeai` (verified 2026-09-26, 14 listings) | Configured (verified feed) |
| FamPay | Bengaluru, India | strong | 6 families | lever board `fampay` (verified 2026-09-27, 15 listings) | Configured (verified feed) |
| Zenoti | Bellevue, US · India: Hyderabad | strong | 8 families | greenhouse board `zenoti` (verified 2026-09-27, 49 listings) | Configured (verified feed) |
| HighRadius | Houston, US · India: Hyderabad, Bhubaneswar | strong | 8 families | greenhouse board `highradius` (verified 2026-09-27, 83 listings) | Configured (verified feed) |
| Zuora | Redwood City, US · India: Chennai | moderate | 8 families | greenhouse board `zuora` (verified 2026-09-27, 27 listings) | Configured (verified feed) |
| Sigmoid | Bengaluru, India · San Francisco, US | strong | 8 families | greenhouse board `sigmoid` (verified 2026-09-27, 36 listings) | Configured (verified feed) |
| Glance | Bengaluru, India | strong | 8 families | greenhouse board `glance` (verified 2026-09-27, 42 listings) | Configured (verified feed) |
| Thoughtworks | Chicago, US · India: Pune, Bengaluru, Chennai, Hyderabad, Gurugram, Coimbatore | strong | 8 families | ashby board `thoughtworks` (verified 2026-09-27, 70 listings) | Configured (verified feed) |
| Turing | Palo Alto, US · remote engineers in India | moderate | 8 families | greenhouse board `turing` (verified 2026-09-27, 34 listings) | Configured (verified feed) |
| HP | Palo Alto, US · India: Bengaluru | strong | 8 families | workday site JSON (unofficial) `hp.wd5.myworkdayjobs.com/hp/ExternalCareerSite` (verified 2026-09-27, 924 listings) | Configured (verified feed) |
| Workday | Pleasanton, US · India: Pune | moderate | 8 families | workday site JSON (unofficial) `workday.wd5.myworkdayjobs.com/workday/Workday` (verified 2026-09-27, 382 listings) | Configured (verified feed) |
| Target (Target in India) | Minneapolis, US · India: Bengaluru | strong | 8 families | workday site JSON (unofficial) `target.wd5.myworkdayjobs.com/target/targetcareers` (verified 2026-09-27, 2000 listings) | Configured (verified feed) |
| Accenture | Dublin, IE · India: Bengaluru, Hyderabad, Pune, Chennai, Mumbai, Gurugram, Kolkata | strong | 14 families | workday site JSON (unofficial) `accenture.wd103.myworkdayjobs.com/accenture/AccentureCareers` (verified 2026-09-27, 2000 listings) | Configured (verified feed) |
| Micron Technology | Boise, US · India: Hyderabad, Bengaluru, Gujarat | strong | 8 families | workday site JSON (unofficial) `micron.wd1.myworkdayjobs.com/micron/External` (verified 2026-09-27, 3057 listings) | Configured (verified feed) |
| Intel | Santa Clara, US · India: Bengaluru, Hyderabad | strong | 8 families | workday site JSON (unofficial) `intel.wd1.myworkdayjobs.com/intel/External` (verified 2026-09-27, 607 listings) | Configured (verified feed) |
| Cadence Design Systems | San Jose, US · India: Bengaluru, Noida, Pune, Hyderabad | strong | 8 families | workday site JSON (unofficial) `cadence.wd1.myworkdayjobs.com/cadence/External_Careers` (verified 2026-09-27, 610 listings) | Configured (verified feed) |
| Nike | Beaverton, US · India: Bengaluru (Nike India Technology Center) | moderate | 8 families | workday site JSON (unofficial) `nike.wd1.myworkdayjobs.com/nike/nke` (verified 2026-09-27, 852 listings) | Configured (verified feed) |
| Citi | New York, US · India: Pune, Chennai, Mumbai, Bengaluru, Gurugram | strong | 8 families | workday site JSON (unofficial) `citi.wd5.myworkdayjobs.com/citi/2` (verified 2026-09-27, 2000 listings) | Configured (verified feed) |
| Barclays | London, UK · India: Pune, Chennai, Noida, Mumbai | strong | 8 families | workday site JSON (unofficial) `barclays.wd3.myworkdayjobs.com/barclays/External_Career_Site_Barclays` (verified 2026-09-27, 794 listings) | Configured (verified feed) |
| NXP Semiconductors | Eindhoven, NL · India: Noida, Bengaluru, Hyderabad, Pune | strong | 5 families | workday site JSON (unofficial) `nxp.wd3.myworkdayjobs.com/nxp/careers` (verified 2026-09-27, 827 listings) | Configured (verified feed) |
| Marvell Technology | Santa Clara, US · India: Bengaluru, Hyderabad, Pune | moderate | 5 families | workday site JSON (unofficial) `marvell.wd1.myworkdayjobs.com/marvell/MarvellCareers` (verified 2026-09-27, 251 listings) | Configured (verified feed) |
