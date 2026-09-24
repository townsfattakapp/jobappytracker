import { defineTrack } from '../define'

export const securityFoundations = defineTrack({
  id: 'track-security-foundations',
  title: 'Security Foundations',
  description: 'The vocabulary and mental models every security role builds on: CIA triad and core principles, threat actors, the kill chain and MITRE ATT&CK, risk and frameworks (NIST CSF, ISO 27001), control types, defence in depth and zero trust, identity, network, endpoint, application and data basics, SOC operations, social engineering, certifications and a safe home lab.',
  family: 'Cybersecurity',
  kind: 'domain',
  icon: '🛡️',
  tags: ['security', 'cia triad', 'risk', 'nist csf', 'iso 27001', 'zero trust', 'mitre att&ck', 'security+', 'home lab'],
  languages: ['Bash', 'Python'],
  explainMode: 'security',
  code: { label: 'the language or tool that fits (bash, python, yaml)', id: 'bash', fixed: true },
  supports: { labs: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'Principles and Vocabulary',
      description: 'The words and models the whole field is built on, used precisely from day one.',
      topics: [
        {
          title: 'The CIA triad',
          description: 'Confidentiality, integrity and availability as the three properties every control protects, with concrete failures for each (a leaked database, a tampered invoice, a ransomed file server) and why a fix for one can weaken another.',
          concepts: ['Confidentiality and disclosure', 'Integrity and unauthorised change', 'Availability and denial', 'Trade-offs between the three', 'Mapping incidents to the triad'],
          quiz: [
            ['Which property does ransomware primarily attack?', 'Availability, by making files unusable; double extortion adds confidentiality.'],
            ['Give an example of an integrity failure.', 'A tampered bank transfer amount or a modified log entry.'],
            ['Why can strong encryption hurt availability?', 'Lose the key and the data is gone; key management becomes a single point of failure.'],
          ],
        },
        {
          title: 'AAA, non-repudiation and accountability',
          description: 'Authentication proves who you are, authorization decides what you may do and accounting records what you did; non-repudiation (signatures, tamper-evident logs) stops a party denying an action later.',
          concepts: ['Authentication versus authorization', 'Accounting and audit trails', 'Non-repudiation with signatures', 'Accountability through unique identities'],
          quiz: [
            ['Why must shared accounts be avoided?', 'Actions cannot be attributed to a single person, breaking accountability.'],
            ['What provides non-repudiation?', 'Digital signatures and tamper-evident logging tied to an identity.'],
          ],
          prereqs: ['The CIA triad'],
        },
        {
          title: 'Vulnerabilities, threats and risk',
          description: 'A vulnerability is a weakness, a threat is something that could exploit it, and risk is the likelihood times the impact of that happening; keeping the three apart is what makes prioritisation possible.',
          concepts: ['Vulnerability as a weakness', 'Threat as a potential cause', 'Exploit and attack surface', 'Risk as likelihood times impact', 'Exposure and asset value'],
          quiz: [
            ['An unpatched server on the internet: which word applies?', 'Vulnerability; the attacker scanning for it is the threat, the combination is risk.'],
            ['Can a vulnerability exist with zero risk?', 'Effectively yes, if there is no plausible threat or no impact if exploited.'],
          ],
          prereqs: ['The CIA triad'],
        },
        {
          title: 'Threat actors and their motivations',
          description: 'Who attacks and why: financially motivated crime groups, state-sponsored espionage, hacktivists, insiders and opportunistic script kiddies, and how motivation and capability shape which defences matter for a given organisation.',
          concepts: ['Cybercrime and ransomware groups', 'Nation-state and APT actors', 'Hacktivists and insiders', 'Capability, intent and opportunity', 'Matching defences to likely actors'],
          quiz: [
            ['What does APT stand for and what characterises it?', 'Advanced Persistent Threat: well-resourced, patient, targeted, usually state-backed.'],
            ['Why are insiders hard to defend against?', 'They already have legitimate access and knowledge of controls.'],
          ],
        },
        {
          title: 'Core security design principles',
          description: 'Least privilege, fail-safe defaults, separation of duties, economy of mechanism, complete mediation and open design (no security through obscurity): the Saltzer and Schroeder rules that still explain most good and bad decisions.',
          concepts: ['Least privilege', 'Fail-safe defaults', 'Separation of duties', 'Complete mediation', 'Open design over obscurity', 'Economy of mechanism'],
          quiz: [
            ['What does fail-safe default mean for a firewall?', 'Deny everything unless explicitly allowed.'],
            ['Why is security through obscurity insufficient?', 'Once the secret design leaks there is no protection left; keys should be the only secret.'],
            ['Give an example of separation of duties.', 'The person who requests a payment cannot also approve it.'],
          ],
          prereqs: ['AAA, non-repudiation and accountability'],
        },
      ],
    },
    {
      title: 'How Attacks Unfold',
      description: 'Models for describing an intrusion step by step, so defences can be placed where they break the chain.',
      topics: [
        {
          title: 'The cyber kill chain',
          description: 'Lockheed Martin\'s seven stages from reconnaissance through weaponisation, delivery, exploitation, installation, command and control, to actions on objectives, and the idea that breaking any one link stops the attack.',
          concepts: ['Reconnaissance and weaponisation', 'Delivery and exploitation', 'Installation and command and control', 'Actions on objectives', 'Breaking the chain early'],
          quiz: [
            ['Which stage does email filtering interrupt?', 'Delivery.'],
            ['What is C2?', 'Command and control: the channel malware uses to receive instructions.'],
          ],
          prereqs: ['Threat actors and their motivations'],
        },
        {
          title: 'MITRE ATT&CK overview',
          description: 'A public matrix of adversary tactics (the why) and techniques (the how) observed in real intrusions, used to name behaviours, map detections and measure coverage; how to read a technique page and navigate the Enterprise matrix.',
          concepts: ['Tactics versus techniques', 'Reading a technique page', 'Enterprise, mobile and ICS matrices', 'Mapping detections to techniques', 'ATT&CK Navigator heat maps'],
          quiz: [
            ['What is the difference between a tactic and a technique?', 'A tactic is the goal (e.g. persistence); a technique is one way to achieve it (e.g. scheduled task).'],
            ['What is T1566?', 'Phishing, under the Initial Access tactic.'],
          ],
          prereqs: ['The cyber kill chain'],
        },
        {
          title: 'Common attack vectors',
          description: 'The ways intrusions actually begin according to breach reports: phishing and credential theft, exploitation of exposed services, stolen or reused passwords, malicious attachments, supply-chain compromise and misconfiguration.',
          concepts: ['Phishing and credential harvesting', 'Exploiting exposed services', 'Password reuse and stuffing', 'Malware delivery channels', 'Supply-chain and third-party compromise'],
          quiz: [
            ['Which initial access vector is consistently most common?', 'Phishing and stolen credentials.'],
            ['What is a supply-chain attack?', 'Compromising a vendor, library or update channel to reach its customers.'],
          ],
          prereqs: ['The cyber kill chain'],
        },
        {
          title: 'CVE, CVSS and vulnerability disclosure',
          description: 'How vulnerabilities get a CVE identifier, how CVSS scores severity from base metrics, why a 9.8 is not always your top priority (exploitability, exposure, KEV), and how coordinated disclosure and bug bounties work.',
          concepts: ['CVE identifiers and the NVD', 'CVSS base metrics', 'Exploited-in-the-wild and KEV', 'Coordinated disclosure timelines', 'Bug bounty programmes'],
          quiz: [
            ['What does a CVSS score of 9.8 mean?', 'Critical severity from base metrics; it says nothing about whether it is exploited in your environment.'],
            ['What is CISA KEV?', 'The Known Exploited Vulnerabilities catalogue, listing CVEs confirmed exploited in the wild.'],
          ],
          prereqs: ['Vulnerabilities, threats and risk'],
        },
      ],
    },
    {
      title: 'Risk Management and Frameworks',
      description: 'Turning threats into decisions a business can make, and the frameworks that structure a programme.',
      topics: [
        {
          title: 'Risk assessment',
          description: 'Identifying assets, threats and vulnerabilities, then estimating likelihood and impact qualitatively (heat maps) or quantitatively (annualised loss expectancy) to produce a ranked risk register.',
          concepts: ['Asset inventory and valuation', 'Likelihood and impact scales', 'Qualitative heat maps', 'Quantitative ALE calculation', 'The risk register'],
          quiz: [
            ['How is annualised loss expectancy calculated?', 'Single loss expectancy times annual rate of occurrence.'],
            ['Why start risk assessment with an asset inventory?', 'You cannot assess the risk to something you do not know you have.'],
          ],
          prereqs: ['Vulnerabilities, threats and risk'],
        },
        {
          title: 'Risk treatment options',
          description: 'The four responses to a risk (mitigate with controls, transfer via insurance or contracts, avoid by not doing the thing, accept with sign-off) and residual risk that remains after treatment.',
          concepts: ['Mitigate, transfer, avoid, accept', 'Residual and inherent risk', 'Risk appetite and tolerance', 'Documenting accepted risks'],
          quiz: [
            ['What is residual risk?', 'The risk left after controls are applied.'],
            ['Who should accept a risk?', 'A business owner with authority over the affected asset, in writing.'],
          ],
          prereqs: ['Risk assessment'],
        },
        {
          title: 'NIST Cybersecurity Framework',
          description: 'The six CSF 2.0 functions (Govern, Identify, Protect, Detect, Respond, Recover), how categories and subcategories describe outcomes rather than tools, and how profiles and tiers measure maturity.',
          concepts: ['The six CSF functions', 'Categories and subcategories', 'Current and target profiles', 'Implementation tiers', 'Mapping controls to CSF'],
          quiz: [
            ['Which function was added in CSF 2.0?', 'Govern.'],
            ['What is a CSF profile?', 'A selection of outcomes describing the current or target state of a programme.'],
          ],
          prereqs: ['Risk treatment options'],
        },
        {
          title: 'ISO 27001 and the ISMS',
          description: 'What an Information Security Management System is, the plan-do-check-act cycle, the Annex A control set, the statement of applicability and what an audit and certification actually involve.',
          concepts: ['ISMS scope and policy', 'Annex A control themes', 'Statement of applicability', 'Internal audit and certification', 'Continual improvement cycle'],
          quiz: [
            ['What is the statement of applicability?', 'A document listing which Annex A controls apply and why others are excluded.'],
            ['Does ISO 27001 certification mean a system is secure?', 'No; it means a management system exists and is followed.'],
          ],
          prereqs: ['NIST Cybersecurity Framework'],
        },
        {
          title: 'Regulation and compliance',
          description: 'Why laws and standards such as GDPR, PCI DSS, HIPAA and SOC 2 exist, what each demands at a high level, and the difference between being compliant and being secure.',
          concepts: ['GDPR principles and breach notification', 'PCI DSS for card data', 'HIPAA and sector regulation', 'SOC 2 trust criteria', 'Compliance versus security'],
          quiz: [
            ['What is the GDPR breach notification deadline?', '72 hours to the supervisory authority.'],
            ['Who must follow PCI DSS?', 'Any organisation that stores, processes or transmits payment card data.'],
          ],
          prereqs: ['ISO 27001 and the ISMS'],
        },
      ],
    },
    {
      title: 'Controls and Architecture',
      description: 'The types of control and the architectural ideas that decide where they go.',
      topics: [
        {
          title: 'Preventive, detective and corrective controls',
          description: 'Classifying controls by when they act: preventive stops the event (MFA, firewall), detective spots it (alerts, log review), corrective restores (backups, patches), with deterrent and compensating controls filling gaps.',
          concepts: ['Preventive controls', 'Detective controls', 'Corrective and recovery controls', 'Deterrent controls', 'Compensating controls'],
          quiz: [
            ['Is a backup preventive or corrective?', 'Corrective; it restores after an incident.'],
            ['What is a compensating control?', 'An alternative that meets the intent when the primary control is not feasible.'],
          ],
          prereqs: ['Core security design principles'],
        },
        {
          title: 'Administrative, technical and physical controls',
          description: 'The second axis of classification: policies and training, software and hardware mechanisms, and locks, badges and cameras; how a single risk is usually treated with all three.',
          concepts: ['Administrative policies and training', 'Technical enforcement', 'Physical security measures', 'Layering the three types'],
          quiz: [
            ['Which type is a password policy?', 'Administrative; the enforcing configuration is technical.'],
            ['Why do physical controls matter for a cloud company?', 'Laptops, offices and badge access still expose data and credentials.'],
          ],
          prereqs: ['Preventive, detective and corrective controls'],
        },
        {
          title: 'Defence in depth',
          description: 'Layering independent controls so that one failure does not become a breach: perimeter, network, host, application, data and people layers, and why layers must fail differently to be worth having.',
          concepts: ['Layers from perimeter to data', 'Independent failure modes', 'Avoiding single points of failure', 'Cost of each extra layer'],
          quiz: [
            ['Why is two copies of the same antivirus not defence in depth?', 'They share failure modes; a bypass of one bypasses both.'],
            ['Name a data-layer control.', 'Encryption at rest with separate key management.'],
          ],
          prereqs: ['Administrative, technical and physical controls'],
        },
        {
          title: 'Zero trust',
          description: 'Replacing the trusted internal network with per-request verification of identity, device and context, least-privilege access to individual resources, and continuous monitoring; NIST 800-207 components and a realistic migration path.',
          concepts: ['Never trust, always verify', 'Policy decision and enforcement points', 'Device posture and context', 'Micro-segmentation', 'Migrating from VPN to ZTNA'],
          quiz: [
            ['What does zero trust remove?', 'Implicit trust based on network location.'],
            ['What is a policy enforcement point?', 'The component that allows or blocks each access request based on the policy decision.'],
          ],
          prereqs: ['Defence in depth'],
        },
        {
          title: 'Network segmentation and security zones',
          description: 'Dividing a network into zones (internet, DMZ, internal, restricted) with controlled crossings, VLANs and firewall rules, so an attacker who lands in one place cannot roam freely.',
          concepts: ['DMZ and zone design', 'VLANs and subnets', 'East-west versus north-south traffic', 'Jump hosts and bastions', 'Blast radius reduction'],
          quiz: [
            ['What belongs in a DMZ?', 'Services that must be reachable from the internet, isolated from internal systems.'],
            ['What is east-west traffic?', 'Traffic between systems inside the network, often unmonitored.'],
          ],
          prereqs: ['Defence in depth'],
        },
      ],
    },
    {
      title: 'Identity, Network and Endpoint Basics',
      description: 'The three places most controls live, at the level needed before the dedicated tracks.',
      topics: [
        {
          title: 'Identity and access basics',
          description: 'Accounts, credentials and the authentication factors (something you know, have, are), why MFA blocks most credential attacks, and how role-based access assigns permissions without per-user chaos.',
          concepts: ['Accounts and credentials', 'The three authentication factors', 'Multi-factor authentication', 'Role-based access assignment', 'Access reviews'],
          quiz: [
            ['Why is SMS the weakest common second factor?', 'SIM swapping and interception; app or hardware factors resist those.'],
            ['What is an access review?', 'A periodic check that each person still needs the access they have.'],
          ],
          prereqs: ['AAA, non-repudiation and accountability'],
        },
        {
          title: 'Passwords and credential hygiene',
          description: 'What makes a password strong against offline cracking versus online guessing, why length beats complexity rules, how password managers and breach checks help, and what NIST 800-63B now recommends.',
          concepts: ['Offline cracking versus online guessing', 'Length over complexity', 'Password managers', 'Breach-list checks', 'NIST 800-63B guidance'],
          quiz: [
            ['Should passwords expire every 90 days?', 'No; NIST recommends changing only on evidence of compromise.'],
            ['Why does length matter more than symbols?', 'Each extra character multiplies the search space far more than a symbol substitution.'],
          ],
          prereqs: ['Identity and access basics'],
        },
        {
          title: 'Network security basics',
          description: 'Firewalls and their rule order, NAT, VPNs for remote access, IDS versus IPS, and what a proxy sees; enough of the network stack to reason about where traffic can be inspected or blocked.',
          concepts: ['Firewall rules and default deny', 'NAT and address translation', 'VPN tunnels', 'IDS versus IPS', 'Proxies and inspection'],
          quiz: [
            ['What is the difference between IDS and IPS?', 'IDS alerts on suspicious traffic; IPS sits inline and blocks it.'],
            ['Why should firewall rules end with a deny?', 'Anything not explicitly permitted must be dropped (fail-safe default).'],
          ],
          prereqs: ['Network segmentation and security zones'],
        },
        {
          title: 'Wireless security',
          description: 'How Wi-Fi authentication and encryption evolved from WEP to WPA3, why open networks expose traffic, enterprise 802.1X versus pre-shared keys, and rogue access point risks.',
          concepts: ['WPA2 versus WPA3', 'PSK versus 802.1X enterprise', 'Evil twin access points', 'Guest network isolation'],
          quiz: [
            ['What does WPA3 add over WPA2?', 'SAE handshake resistant to offline dictionary attacks and forward secrecy.'],
            ['What is an evil twin?', 'A rogue access point imitating a legitimate network name to capture traffic.'],
          ],
          prereqs: ['Network security basics'],
        },
        {
          title: 'Endpoint security',
          description: 'Protecting laptops and servers: patching, signature and behavioural antivirus, EDR telemetry and response, disk encryption, application allow-listing and hardening baselines, and why endpoints are where most incidents are detected.',
          concepts: ['Patching cadence', 'Antivirus versus EDR', 'Full-disk encryption', 'Application allow-listing', 'Hardening baselines'],
          quiz: [
            ['What does EDR add over antivirus?', 'Continuous telemetry, behavioural detection and remote response actions.'],
            ['Why encrypt laptop disks?', 'A lost or stolen device otherwise exposes every file to anyone who removes the drive.'],
          ],
          prereqs: ['Network security basics'],
        },
        {
          title: 'Email security',
          description: 'How SPF, DKIM and DMARC let receivers reject forged sender domains, what secure email gateways filter, and why email remains the most common delivery path for phishing and malware.',
          concepts: ['SPF sender lists', 'DKIM signatures', 'DMARC policy and reports', 'Secure email gateways', 'Attachment sandboxing'],
          quiz: [
            ['What does DMARC add to SPF and DKIM?', 'A policy telling receivers what to do on failure and alignment with the From header.'],
            ['Can SPF alone stop spoofing of the From header?', 'No; SPF checks the envelope sender, not the displayed From.'],
          ],
          prereqs: ['Common attack vectors'],
        },
      ],
    },
    {
      title: 'Applications, Data and Privacy',
      description: 'Where the valuable data lives and the basic ways applications and storage fail.',
      topics: [
        {
          title: 'Application security basics',
          description: 'The OWASP Top 10 as a map of how web applications fail (injection, broken access control, misconfiguration, vulnerable components), and the idea that security is built in with validation, least privilege and testing, not bolted on.',
          concepts: ['OWASP Top 10 categories', 'Injection and validation', 'Broken access control', 'Vulnerable components', 'Security in the SDLC'],
          quiz: [
            ['What is number one in the 2021 OWASP Top 10?', 'Broken access control.'],
            ['What is the root cause of SQL injection?', 'Mixing untrusted input into a query string instead of parameterising it.'],
          ],
          prereqs: ['Common attack vectors'],
        },
        {
          title: 'Cryptography in practice',
          description: 'Where encryption, hashing and signatures show up in everyday systems (TLS, disk encryption, password storage, code signing), what each guarantees, and why key management is the hard part.',
          concepts: ['Encryption in transit and at rest', 'Hashing for integrity', 'Signatures and trust', 'Key management burden', 'Recognising bad crypto choices'],
          quiz: [
            ['Why hash passwords instead of encrypting them?', 'A hash cannot be reversed, so a stolen database does not reveal passwords directly.'],
            ['What does TLS provide?', 'Confidentiality, integrity and server authentication for data in transit.'],
          ],
          prereqs: ['The CIA triad'],
        },
        {
          title: 'Data classification and protection',
          description: 'Labelling data by sensitivity (public, internal, confidential, restricted) so handling rules follow the label, and the protections that rely on it: encryption, DLP, retention limits and the 3-2-1 backup rule.',
          concepts: ['Classification levels', 'Handling rules per level', 'Data loss prevention', 'Retention and secure deletion', '3-2-1 backups'],
          quiz: [
            ['What is the 3-2-1 backup rule?', 'Three copies, two media types, one off-site (and ideally offline).'],
            ['Why classify data?', 'So controls match sensitivity instead of applying the strictest rule everywhere.'],
          ],
          prereqs: ['Cryptography in practice'],
        },
        {
          title: 'Privacy principles',
          description: 'Privacy as a distinct discipline: data minimisation, purpose limitation, consent and lawful basis, data subject rights, privacy by design, and the difference between PII, sensitive data and anonymised data.',
          concepts: ['PII and special categories', 'Data minimisation', 'Purpose limitation and consent', 'Data subject rights', 'Privacy by design'],
          quiz: [
            ['What is data minimisation?', 'Collecting and keeping only the data needed for a stated purpose.'],
            ['Is pseudonymised data still personal data?', 'Yes under GDPR, because it can be re-linked with the key.'],
          ],
          prereqs: ['Data classification and protection', 'Regulation and compliance'],
        },
      ],
    },
    {
      title: 'Operations and People',
      description: 'How security is run day to day, and the human layer attackers target first.',
      topics: [
        {
          title: 'Security operations overview',
          description: 'What a SOC does: collecting logs into a SIEM, writing detections, triaging alerts by tier, threat hunting and the metrics (MTTD, MTTR, false-positive rate) that show whether it is working.',
          concepts: ['Log collection and SIEM', 'Detection rules and alerts', 'Tiered triage', 'Threat hunting', 'MTTD and MTTR'],
          quiz: [
            ['What is a SIEM?', 'A platform that aggregates logs and runs correlation rules to raise alerts.'],
            ['What does MTTD measure?', 'Mean time to detect an incident after it begins.'],
          ],
          prereqs: ['Preventive, detective and corrective controls'],
        },
        {
          title: 'Incident response lifecycle',
          description: 'The NIST phases (preparation, detection and analysis, containment, eradication, recovery, lessons learned), what a playbook contains, and why containment decisions are made before the full picture is known.',
          concepts: ['Preparation and playbooks', 'Detection and analysis', 'Containment strategies', 'Eradication and recovery', 'Post-incident review'],
          quiz: [
            ['What is the goal of containment?', 'Stop the damage spreading while preserving evidence.'],
            ['Why write a post-incident report?', 'To fix root causes and improve detection, not to assign blame.'],
          ],
          prereqs: ['Security operations overview'],
        },
        {
          title: 'Business continuity and disaster recovery',
          description: 'Keeping the business running through outages: business impact analysis, RTO and RPO targets, backup and failover strategies, and testing the plan before it is needed.',
          concepts: ['Business impact analysis', 'RTO and RPO', 'Hot, warm and cold sites', 'Backup restore testing', 'Tabletop exercises'],
          quiz: [
            ['What is RPO?', 'Recovery point objective: the maximum acceptable data loss measured in time.'],
            ['Why test restores?', 'A backup that has never been restored is an assumption, not a control.'],
          ],
          prereqs: ['Incident response lifecycle'],
        },
        {
          title: 'Social engineering',
          description: 'Manipulating people rather than systems: phishing, vishing, pretexting, baiting and tailgating, the psychological levers (urgency, authority, reciprocity) they pull, and how to recognise and report an attempt.',
          concepts: ['Phishing, vishing and smishing', 'Pretexting and impersonation', 'Psychological triggers', 'Physical social engineering', 'Reporting culture'],
          quiz: [
            ['What is pretexting?', 'Inventing a believable scenario to obtain information or access.'],
            ['Why does urgency work?', 'It pushes the target to act before thinking or verifying.'],
          ],
          prereqs: ['Common attack vectors'],
        },
        {
          title: 'Security awareness programmes',
          description: 'Designing training that changes behaviour: role-specific content, simulated phishing done without shaming, clear reporting paths, measuring click and report rates, and making the secure path the easy one.',
          concepts: ['Role-based training', 'Phishing simulations done well', 'Measuring report rates', 'Blame-free reporting', 'Secure defaults over lectures'],
          quiz: [
            ['What metric matters more than click rate?', 'Report rate: how many people flag the phish.'],
            ['Why avoid punishing clickers?', 'Punishment reduces reporting, which is the behaviour you need most.'],
          ],
          prereqs: ['Social engineering'],
        },
      ],
    },
    {
      title: 'Careers, Certifications and Home Lab',
      description: 'Where the field goes from here and how to practise safely and legally.',
      topics: [
        {
          title: 'Security roles and career paths',
          description: 'What SOC analysts, security engineers, penetration testers, GRC specialists, cloud security engineers and application security engineers actually do day to day, and which skills transfer between them.',
          concepts: ['Blue, red and purple teams', 'Engineering versus analysis roles', 'GRC and audit roles', 'Building a portfolio', 'Entry routes from IT and dev'],
          quiz: [
            ['What does a purple team do?', 'Runs attacks and detections together to improve defences collaboratively.'],
            ['Which role writes and tunes SIEM detections?', 'Detection engineer or SOC analyst.'],
          ],
        },
        {
          title: 'CompTIA Security+ domains',
          description: 'The five SY0-701 domains (general concepts, threats and mitigations, architecture, operations, programme management), what each expects, and how to use the objectives as a self-study checklist.',
          concepts: ['General security concepts', 'Threats, vulnerabilities, mitigations', 'Security architecture domain', 'Security operations domain', 'Programme management and oversight'],
          quiz: [
            ['How many domains does SY0-701 have?', 'Five.'],
            ['Is Security+ vendor-neutral?', 'Yes; it covers concepts rather than a specific product.'],
          ],
          prereqs: ['Security roles and career paths'],
        },
        {
          title: 'CISSP domains overview',
          description: 'The eight CISSP domains from security and risk management to software development security, why it is a management-level certification with an experience requirement, and how its breadth maps to this track.',
          concepts: ['Security and risk management', 'Asset and security architecture domains', 'Network and identity domains', 'Assessment, operations and software domains', 'Experience requirements'],
          quiz: [
            ['How much experience does CISSP require?', 'Five years in two or more domains (one year waivable).'],
            ['Which domain covers business continuity?', 'Security and Risk Management.'],
          ],
          prereqs: ['CompTIA Security+ domains'],
        },
        {
          title: 'Building a safe home lab',
          description: 'A practice environment that cannot harm anyone: VirtualBox or Proxmox with an isolated host-only network, Kali plus deliberately vulnerable targets (Metasploitable, DVWA, Juice Shop), snapshots for reset, and TryHackMe or Hack The Box for guided rooms.',
          concepts: ['Hypervisor and isolated networking', 'Vulnerable target VMs', 'Snapshots and reset', 'Guided lab platforms', 'Documenting what you learn'],
          quiz: [
            ['Why use a host-only or internal network?', 'So vulnerable VMs are unreachable from the internet and cannot reach it.'],
            ['Name two deliberately vulnerable applications.', 'OWASP Juice Shop and DVWA.'],
          ],
        },
        {
          title: 'Legal and ethical boundaries',
          description: 'Computer misuse laws, why written authorisation and scope define legal testing, responsible disclosure etiquette, and how to practise offensive techniques without ever touching systems you do not own.',
          concepts: ['Authorisation and scope', 'Computer misuse legislation', 'Responsible disclosure etiquette', 'Rules of engagement', 'Ethics of tooling'],
          quiz: [
            ['Is port scanning a stranger\'s server legal?', 'Often not; without authorisation it may breach computer misuse laws.'],
            ['What document defines what a pentester may do?', 'The rules of engagement and signed scope.'],
          ],
          prereqs: ['Building a safe home lab'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Defensive lab work that turns the vocabulary into evidence of skill.',
      topics: [
        {
          title: 'Project: isolated home lab with vulnerable targets',
          description: 'Build a hypervisor lab with a host-only network, a Kali VM, Metasploitable and OWASP Juice Shop, snapshots for every machine, and a written network diagram and reset procedure; verify no target can reach the internet.',
          concepts: ['Plan the network and VMs', 'Install and isolate targets', 'Snapshot and verify isolation', 'Document the lab'],
          quiz: [
            ['How do you prove isolation?', 'From a target VM, attempt to reach an external address and confirm it fails.'],
            ['Why snapshot before each exercise?', 'To reset a compromised or broken target in seconds.'],
          ],
          style: 'project',
          prereqs: ['Building a safe home lab'],
        },
        {
          title: 'Project: risk register for a small business',
          description: 'Model a fictional 20-person company, inventory its assets, list realistic threats, score likelihood and impact, choose a treatment for each risk and map controls to NIST CSF functions in a spreadsheet plus a two-page summary.',
          concepts: ['Inventory assets and data', 'Enumerate threats and vulnerabilities', 'Score and rank risks', 'Assign treatments and CSF mapping'],
          quiz: [
            ['What should the top of the register look like?', 'The highest likelihood-times-impact risks with an owner and treatment each.'],
            ['Why map to CSF?', 'To show coverage gaps by function.'],
          ],
          style: 'project',
          prereqs: ['NIST Cybersecurity Framework'],
        },
        {
          title: 'Project: phishing analysis and awareness kit',
          description: 'Collect sample phishing emails from public corpora, analyse headers for SPF/DKIM/DMARC results, extract indicators safely, and produce a one-page staff guide plus a reporting procedure.',
          concepts: ['Gather safe samples', 'Analyse headers and links', 'Extract indicators of compromise', 'Write the awareness guide'],
          quiz: [
            ['Where in a header do you see the SPF result?', 'The Authentication-Results header.'],
            ['How do you inspect a link safely?', 'Copy it to a sandbox or URL scanner rather than clicking.'],
          ],
          style: 'project',
          prereqs: ['Email security', 'Social engineering'],
        },
        {
          title: 'Project: ATT&CK-mapped incident walkthrough',
          description: 'Take a public breach report, reconstruct the attack as kill-chain stages, map each action to ATT&CK techniques in Navigator, and propose one preventive and one detective control per stage.',
          concepts: ['Choose and read a breach report', 'Reconstruct the timeline', 'Map to ATT&CK in Navigator', 'Propose controls per stage'],
          quiz: [
            ['What does a Navigator layer show?', 'Which techniques were used or covered, colour-coded on the matrix.'],
            ['Why pair each stage with a detective control?', 'Prevention fails; detection limits dwell time.'],
          ],
          style: 'project',
          prereqs: ['MITRE ATT&CK overview'],
        },
        {
          title: 'Security fundamentals interview questions',
          description: 'The questions asked for entry-level security roles: explain the CIA triad with examples, difference between a vulnerability and a threat, how you would prioritise patches, what zero trust means, and how you stay current.',
          concepts: ['Explaining the triad concretely', 'Risk and prioritisation answers', 'Architecture and control questions', 'Showing curiosity and sources'],
          quiz: [
            ['How would you prioritise 200 vulnerabilities?', 'Exploited-in-the-wild first, then internet exposure and asset criticality, then CVSS.'],
            ['What is the difference between IDS and EDR?', 'IDS watches network traffic; EDR watches endpoint behaviour.'],
          ],
          style: 'reading',
        },
        {
          title: 'Scenario and behavioural questions',
          description: 'Walking through scenarios interviewers love: a user reports a suspicious email, a server shows unexpected outbound traffic, a developer wants to disable MFA; how to structure an answer with triage, containment and communication.',
          concepts: ['Structuring a scenario answer', 'Triage and escalation language', 'Balancing security and business', 'Admitting unknowns well'],
          quiz: [
            ['First step when a user reports a phish?', 'Thank them, preserve the email, check who else received it.'],
            ['How do you answer a question you do not know?', 'State what you would check and how you would find out.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
