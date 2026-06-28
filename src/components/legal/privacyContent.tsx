import type { LegalDocument } from "./types";

const COMPANY = "Praesidio Care Private Limited";
const PRODUCT = "PickleBuzz";
const WEBSITE = "https://www.picklebuzz.in";
const PRIVACY_EMAIL = "privacy@picklebuzz.in";
const SUPPORT_EMAIL = "support@picklebuzz.in";
const LAST_UPDATED = "28 June 2026";

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  subtitle: `How ${PRODUCT} collects, uses, stores, and protects your personal data in accordance with the Digital Personal Data Protection Act, 2023 (India) and applicable laws.`,
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      content: (
        <>
          <p>
            This Privacy Policy (&quot;Policy&quot;) describes how{" "}
            <strong className="text-foreground">{COMPANY}</strong> (&quot;we&quot;,
            &quot;us&quot;, or &quot;our&quot;), operating the {PRODUCT} platform
            at{" "}
            <a
              href={WEBSITE}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {WEBSITE}
            </a>{" "}
            (&quot;Platform&quot;, &quot;Service&quot;), collects, processes, stores,
            shares, and protects your personal data.
          </p>
          <p>
            We are committed to protecting your privacy and processing personal data
            in a lawful, fair, and transparent manner. This Policy is designed to
            comply with the <strong className="text-foreground">Digital Personal Data Protection Act, 2023</strong> (&quot;DPDP Act&quot;) and the rules, regulations, and
            guidelines issued thereunder, as well as other applicable Indian laws.
          </p>
          <p>
            By accessing or using the Platform, creating an account, or otherwise
            providing us with your personal data, you acknowledge that you have read
            and understood this Policy. Where consent is required under the DPDP Act,
            we will obtain your freely given, specific, informed, and unambiguous
            consent before processing your personal data for the relevant purpose.
          </p>
        </>
      ),
    },
    {
      id: "definitions",
      title: "Definitions",
      content: (
        <>
          <p>For the purposes of this Policy, the following terms shall have the meanings assigned below, consistent with the DPDP Act where applicable:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Data Principal</strong> — the
              individual to whom the personal data relates (you, the user).
            </li>
            <li>
              <strong className="text-foreground">Data Fiduciary</strong> —{" "}
              {COMPANY}, which determines the purpose and means of processing your
              personal data through the Platform.
            </li>
            <li>
              <strong className="text-foreground">Data Processor</strong> — any
              third party that processes personal data on our behalf under a valid
              contract and in accordance with our instructions.
            </li>
            <li>
              <strong className="text-foreground">Personal Data</strong> — any
              data about an individual who is identifiable by or in relation to such
              data, including data that can be reasonably used to identify you
              directly or indirectly.
            </li>
            <li>
              <strong className="text-foreground">Processing</strong> — any
              operation performed on personal data, including collection, storage,
              use, disclosure, sharing, erasure, or destruction.
            </li>
            <li>
              <strong className="text-foreground">Consent</strong> — your free,
              specific, informed, and unambiguous indication of agreement to the
              processing of your personal data for a specified purpose.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "data-fiduciary",
      title: "Data Fiduciary & Contact Details",
      content: (
        <>
          <p>
            <strong className="text-foreground">Data Fiduciary:</strong> {COMPANY}
          </p>
          <p>
            <strong className="text-foreground">Platform:</strong> {PRODUCT}
          </p>
          <p>
            <strong className="text-foreground">Website:</strong>{" "}
            <a href={WEBSITE} className="text-primary hover:underline">
              {WEBSITE}
            </a>
          </p>
          <p>
            <strong className="text-foreground">Privacy & Data Protection:</strong>{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline">
              {PRIVACY_EMAIL}
            </a>
          </p>
          <p>
            <strong className="text-foreground">General Support:</strong>{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
          <p>
            If you have questions about this Policy, wish to exercise your rights as
            a Data Principal, or need to raise a grievance regarding the processing of
            your personal data, please contact us using the details above.
          </p>
        </>
      ),
    },
    {
      id: "data-collected",
      title: "Personal Data We Collect",
      content: (
        <>
          <p>
            We collect personal data that is necessary to provide, maintain, improve,
            and secure the Platform. The categories of personal data we may collect
            include:
          </p>
          <h3 className="font-semibold text-foreground">Account & Identity Data</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Full name, display name, and profile photograph (avatar)</li>
            <li>Email address and authentication credentials</li>
            <li>Phone number (where provided)</li>
            <li>City, location, and other profile details you choose to provide</li>
            <li>User role (player, organizer, referee, club owner, administrator)</li>
            <li>Skill level, DUPR rating, and competitive profile information</li>
          </ul>
          <h3 className="mt-4 font-semibold text-foreground">Match & Activity Data</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Match setup details, scores, game results, and match history</li>
            <li>Team assignments, player participation, and performance statistics</li>
            <li>Match events (points, faults, timeouts, and related scoring data)</li>
            <li>Venue, court number, and match metadata</li>
            <li>Tournament registrations, categories, and bracket participation</li>
          </ul>
          <h3 className="mt-4 font-semibold text-foreground">Club & Organizer Data</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Club name, location, amenities, contact details, and ratings</li>
            <li>Tournament details, rules, schedules, and organizer communications</li>
            <li>Administrative and moderation records where applicable</li>
          </ul>
          <h3 className="mt-4 font-semibold text-foreground">Payment & Transaction Data</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tournament entry fees, payment status, and transaction references</li>
            <li>Payment identifiers processed through our payment partner (Razorpay)</li>
            <li>
              We do <em>not</em> store full credit/debit card numbers, CVV, or UPI PIN
              on our servers; such sensitive payment credentials are handled directly by
              our PCI-DSS compliant payment processor
            </li>
          </ul>
          <h3 className="mt-4 font-semibold text-foreground">Technical & Usage Data</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Device type, operating system, browser type, and app version</li>
            <li>IP address, session identifiers, and access timestamps</li>
            <li>Log data, crash reports, and diagnostic information</li>
            <li>Feature usage, navigation patterns, and interaction analytics</li>
            <li>Cookies and similar technologies (see Section on Cookies)</li>
          </ul>
          <h3 className="mt-4 font-semibold text-foreground">Communications Data</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Support requests, feedback, and correspondence with us</li>
            <li>Notifications and service-related communications you receive</li>
          </ul>
          <p className="mt-4">
            We do not intentionally collect special categories of personal data (such as
            health data, biometric data for identification, or data revealing racial or
            ethnic origin) unless you voluntarily provide such information and we have a
            lawful basis to process it. Please do not submit sensitive personal data
            unless explicitly requested for a specific feature.
          </p>
        </>
      ),
    },
    {
      id: "how-collected",
      title: "How We Collect Personal Data",
      content: (
        <>
          <p>We collect personal data through the following means:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Directly from you</strong> — when
              you register, complete your profile, create or join matches and
              tournaments, make payments, contact support, or otherwise interact with
              the Platform.
            </li>
            <li>
              <strong className="text-foreground">Authentication providers</strong> —
              when you sign in using Google Single Sign-On (SSO) or other supported
              identity providers, we receive certain profile information (such as your
              name and email address) as permitted by your settings with that provider.
            </li>
            <li>
              <strong className="text-foreground">Automatically</strong> — through
              cookies, log files, and similar technologies when you access the
              Platform via web browser or mobile application.
            </li>
            <li>
              <strong className="text-foreground">From other users</strong> — when
              organizers, referees, or fellow players add you to matches,
              tournaments, or club rosters, or when match results are recorded.
            </li>
            <li>
              <strong className="text-foreground">From service providers</strong> —
              such as payment processors, hosting providers, and analytics services
              that assist us in operating the Platform.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "purposes",
      title: "Purposes & Lawful Basis for Processing",
      content: (
        <>
          <p>
            We process your personal data only for specified, explicit, and legitimate
            purposes. Under the DPDP Act, our lawful bases may include your consent,
            performance of a contract, compliance with legal obligations, and certain
            legitimate uses as permitted by law.
          </p>
          <p>We process personal data for the following purposes:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Creating and managing your account and user profile</li>
            <li>Enabling match scoring, live scoring, and tournament management</li>
            <li>Displaying rankings, leaderboards, statistics, and match history</li>
            <li>Facilitating club discovery, tournament registration, and payments</li>
            <li>Processing payments and managing financial transactions</li>
            <li>Providing customer support and responding to your inquiries</li>
            <li>Sending service-related notifications (match updates, tournament alerts, account notices)</li>
            <li>Improving Platform performance, security, and user experience</li>
            <li>Detecting, preventing, and addressing fraud, abuse, and security incidents</li>
            <li>Enforcing our Terms of Service and protecting the rights of users and third parties</li>
            <li>Complying with applicable laws, regulations, court orders, and lawful government requests</li>
            <li>Conducting analytics and aggregated reporting that does not identify individuals</li>
          </ul>
          <p>
            Where processing is based on consent, you may withdraw consent at any time
            by contacting us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline">
              {PRIVACY_EMAIL}
            </a>
            . Withdrawal of consent will not affect the lawfulness of processing
            carried out before withdrawal, and may limit your ability to use certain
            features of the Platform.
          </p>
        </>
      ),
    },
    {
      id: "sharing",
      title: "Sharing & Disclosure of Personal Data",
      content: (
        <>
          <p>
            We do not sell your personal data. We may share your personal data only in
            the circumstances described below, and always in accordance with this Policy
            and applicable law.
          </p>
          <h3 className="font-semibold text-foreground">Service Providers (Data Processors)</h3>
          <p>
            We engage trusted third-party service providers who process personal data
            on our behalf under contractual obligations, including:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Supabase</strong> — authentication,
              database hosting, and backend infrastructure
            </li>
            <li>
              <strong className="text-foreground">Razorpay</strong> — payment
              processing for tournament fees and related transactions
            </li>
            <li>
              <strong className="text-foreground">Google</strong> — OAuth-based
              authentication when you choose to sign in with Google
            </li>
            <li>
              Cloud hosting, content delivery, analytics, email delivery, and security
              monitoring providers as required for Platform operations
            </li>
          </ul>
          <h3 className="mt-4 font-semibold text-foreground">Other Users & Public Display</h3>
          <p>
            Certain information you provide — such as your name, profile photo, city,
            match results, rankings, and tournament participation — may be visible to
            other users on the Platform or to spectators viewing public matches and
            tournaments, depending on your privacy settings and the public nature of
            the content.
          </p>
          <h3 className="mt-4 font-semibold text-foreground">Legal & Regulatory Disclosures</h3>
          <p>
            We may disclose personal data where required by law, regulation, legal
            process, or governmental request, or where necessary to protect the rights,
            property, or safety of {COMPANY}, our users, or the public.
          </p>
          <h3 className="mt-4 font-semibold text-foreground">Business Transfers</h3>
          <p>
            In the event of a merger, acquisition, reorganization, or sale of assets,
            your personal data may be transferred to the successor entity, subject to
            the same protections described in this Policy. We will notify you of any
            material change in data fiduciary identity where required by law.
          </p>
        </>
      ),
    },
    {
      id: "cross-border",
      title: "Cross-Border Data Transfers",
      content: (
        <>
          <p>
            Some of our service providers may store or process personal data on servers
            located outside India. Where personal data is transferred to countries or
            territories outside India, we take appropriate steps to ensure that such
            transfers comply with the DPDP Act and applicable rules, including through
            contractual safeguards, standard contractual clauses, or other mechanisms
            recognized under Indian law.
          </p>
          <p>
            By using the Platform, you acknowledge that your personal data may be
            transferred to and processed in jurisdictions that may have different data
            protection laws than India, and that we will implement reasonable safeguards
            to protect your data in accordance with this Policy.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      title: "Data Retention",
      content: (
        <>
          <p>
            We retain personal data only for as long as necessary to fulfil the
            purposes for which it was collected, including to satisfy legal,
            accounting, tax, or reporting requirements, resolve disputes, and enforce
            our agreements.
          </p>
          <p>Retention periods vary depending on the type of data and purpose:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Account data</strong> — retained for
              the duration of your account and for a reasonable period thereafter
              (typically up to 3 years) unless deletion is requested earlier.
            </li>
            <li>
              <strong className="text-foreground">Match & tournament records</strong>{" "}
              — retained to maintain historical rankings, integrity of competition
              records, and audit trails; certain aggregated statistics may be retained
              indefinitely in anonymized form.
            </li>
            <li>
              <strong className="text-foreground">Payment records</strong> — retained
              as required under applicable tax, accounting, and financial regulations
              (typically 7–8 years under Indian law).
            </li>
            <li>
              <strong className="text-foreground">Technical logs</strong> — retained
              for security and diagnostic purposes, generally for 90 days to 12 months
              unless a longer period is required for incident investigation.
            </li>
          </ul>
          <p>
            When personal data is no longer required, we will securely delete or
            anonymize it in accordance with our data retention schedule and applicable
            law.
          </p>
        </>
      ),
    },
    {
      id: "security",
      title: "Security Safeguards",
      content: (
        <>
          <p>
            We implement reasonable security safeguards — technical and organizational —
            designed to protect personal data against unauthorized access, disclosure,
            alteration, destruction, loss, or misuse, consistent with the DPDP Act and
            industry standards.
          </p>
          <p>Our security measures include, where appropriate:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Encryption of data in transit (TLS/HTTPS) and at rest where applicable</li>
            <li>Role-based access controls and authentication mechanisms</li>
            <li>Row-level security policies on database tables</li>
            <li>Regular security reviews and monitoring for suspicious activity</li>
            <li>Rate limiting and abuse prevention on API endpoints</li>
            <li>Secure payment processing through PCI-DSS compliant partners</li>
            <li>Employee and contractor access restrictions on a need-to-know basis</li>
          </ul>
          <p>
            While we strive to protect your personal data, no method of transmission
            over the internet or electronic storage is completely secure. You are
            responsible for maintaining the confidentiality of your account credentials
            and for notifying us promptly of any unauthorized access or suspected breach.
          </p>
          <p>
            In the event of a personal data breach that is likely to affect you, we will
            notify the Data Protection Board of India and affected Data Principals in
            accordance with the DPDP Act and applicable rules.
          </p>
        </>
      ),
    },
    {
      id: "rights",
      title: "Your Rights as a Data Principal",
      content: (
        <>
          <p>
            Under the DPDP Act, you have the following rights in relation to your
            personal data, subject to applicable exceptions and legal requirements:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Right to Access</strong> — request
              information about the personal data we hold about you and how it is
              processed.
            </li>
            <li>
              <strong className="text-foreground">Right to Correction</strong> — request
              correction of inaccurate or incomplete personal data. You may also update
              certain information directly through your profile settings.
            </li>
            <li>
              <strong className="text-foreground">Right to Erasure</strong> — request
              deletion of your personal data where it is no longer necessary for the
              purpose for which it was collected, where you withdraw consent (and no
              other lawful basis applies), or as otherwise permitted under the DPDP Act.
            </li>
            <li>
              <strong className="text-foreground">Right to Grievance Redressal</strong>{" "}
              — lodge a complaint with us regarding our processing of your personal data.
            </li>
            <li>
              <strong className="text-foreground">Right to Nominate</strong> — nominate
              another individual to exercise your rights in the event of your death or
              incapacity, in accordance with the DPDP Act.
            </li>
            <li>
              <strong className="text-foreground">Right to Withdraw Consent</strong> —
              where processing is based on consent, withdraw consent at any time without
              affecting the lawfulness of prior processing.
            </li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline">
              {PRIVACY_EMAIL}
            </a>
            . We will respond to verified requests within the timelines prescribed under
            the DPDP Act (generally within a reasonable period, and in any event as
            required by applicable rules). We may request additional information to
            verify your identity before processing your request.
          </p>
          <p>
            If you are dissatisfied with our response, you may escalate your grievance
            to our Grievance Officer (see below) and, subsequently, approach the Data
            Protection Board of India as provided under the DPDP Act.
          </p>
        </>
      ),
    },
    {
      id: "grievance-officer",
      title: "Grievance Officer",
      content: (
        <>
          <p>
            In accordance with the DPDP Act and the Information Technology (Intermediary
            Guidelines and Digital Media Ethics Code) Rules, 2021, we have designated a
            Grievance Officer to address your concerns regarding the processing of your
            personal data.
          </p>
          <p>
            <strong className="text-foreground">Grievance Officer</strong>
            <br />
            {COMPANY}
            <br />
            Email:{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline">
              {PRIVACY_EMAIL}
            </a>
          </p>
          <p>
            The Grievance Officer will acknowledge your complaint within 24 hours and
            endeavour to resolve it within 15 days of receipt, or within such other
            period as may be prescribed under applicable law. If your grievance relates
            to content on the Platform, we will act in accordance with applicable
            intermediary obligations.
          </p>
        </>
      ),
    },
    {
      id: "children",
      title: "Children&apos;s Privacy",
      content: (
        <>
          <p>
            The Platform is intended for users who are at least <strong className="text-foreground">13 years of age</strong>.
            We do not knowingly collect personal data from children under 13 without
            verifiable parental or lawful guardian consent.
          </p>
          <p>
            Users between 13 and 18 years of age (&quot;children&quot; under the DPDP
            Act) may use the Platform only with the consent of a parent or lawful
            guardian, who is responsible for the child&apos;s use of the Platform and
            for ensuring that any personal data provided complies with applicable law.
          </p>
          <p>
            If we become aware that we have collected personal data from a child without
            appropriate consent, we will take steps to delete such data promptly. Parents
            or guardians who believe their child has provided personal data without
            consent may contact us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline">
              {PRIVACY_EMAIL}
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies & Similar Technologies",
      content: (
        <>
          <p>
            We use cookies, local storage, session tokens, and similar technologies to
            operate the Platform, maintain your login session, remember your preferences,
            and understand how users interact with our services.
          </p>
          <p>Types of cookies we may use include:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Essential cookies</strong> — required
              for authentication, security, and core Platform functionality
            </li>
            <li>
              <strong className="text-foreground">Functional cookies</strong> — remember
              your settings and preferences
            </li>
            <li>
              <strong className="text-foreground">Analytics cookies</strong> — help us
              understand usage patterns and improve the Platform
            </li>
          </ul>
          <p>
            You can control cookies through your browser settings. Disabling essential
            cookies may affect your ability to use certain features of the Platform,
            including staying logged in.
          </p>
        </>
      ),
    },
    {
      id: "third-party-links",
      title: "Third-Party Links & Services",
      content: (
        <>
          <p>
            The Platform may contain links to third-party websites, applications, or
            services that are not operated by us. This Policy does not apply to those
            third-party services. We encourage you to review the privacy policies of
            any third-party services you access, including Google (for SSO) and
            Razorpay (for payments).
          </p>
          <p>
            Your interactions with third-party services are governed by their respective
            terms and privacy policies. We are not responsible for the privacy practices
            of third parties.
          </p>
        </>
      ),
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      content: (
        <>
          <p>
            We may update this Policy from time to time to reflect changes in our
            practices, technology, legal requirements, or business operations. When we
            make material changes, we will notify you by posting the updated Policy on
            the Platform with a revised &quot;Last updated&quot; date, and where
            required by law, by obtaining your fresh consent or providing notice through
            email or in-app notification.
          </p>
          <p>
            Your continued use of the Platform after the effective date of an updated
            Policy constitutes your acknowledgment of the changes, except where additional
            consent is required under the DPDP Act.
          </p>
        </>
      ),
    },
    {
      id: "governing-law",
      title: "Governing Law & Jurisdiction",
      content: (
        <>
          <p>
            This Policy is governed by the laws of India, including the DPDP Act and
            other applicable data protection and information technology laws. Any
            disputes arising out of or relating to this Policy shall be subject to the
            exclusive jurisdiction of the competent courts in India, unless otherwise
            required by mandatory applicable law.
          </p>
        </>
      ),
    },
  ],
};
