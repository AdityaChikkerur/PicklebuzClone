import type { LegalDocument } from "./types";

const COMPANY = "Praesidio Care Private Limited";
const PRODUCT = "PickleBuzz";
const WEBSITE = "https://www.picklebuzz.in";
const SUPPORT_EMAIL = "support@picklebuzz.in";
const PRIVACY_EMAIL = "privacy@picklebuzz.in";
const LAST_UPDATED = "28 June 2026";

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  subtitle: `The terms and conditions governing your access to and use of the ${PRODUCT} platform operated by ${COMPANY}.`,
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      id: "agreement",
      title: "Agreement to Terms",
      content: (
        <>
          <p>
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding
            agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;)
            and <strong className="text-foreground">{COMPANY}</strong> (&quot;Company&quot;,
            &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) governing your access to
            and use of the {PRODUCT} website, mobile application, and related services
            (collectively, the &quot;Platform&quot; or &quot;Service&quot;) available at{" "}
            <a
              href={WEBSITE}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {WEBSITE}
            </a>
            .
          </p>
          <p>
            By creating an account, accessing, or using the Platform, you confirm that
            you have read, understood, and agree to be bound by these Terms and our{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            , which is incorporated herein by reference. If you do not agree to these
            Terms, you must not access or use the Platform.
          </p>
          <p>
            If you are using the Platform on behalf of an organization (such as a club,
            academy, or tournament organizer), you represent and warrant that you have the
            authority to bind that organization to these Terms.
          </p>
        </>
      ),
    },
    {
      id: "eligibility",
      title: "Eligibility",
      content: (
        <>
          <p>To use the Platform, you must:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Be at least 13 years of age</li>
            <li>
              If you are between 13 and 18 years of age, have the consent of a parent
              or lawful guardian who agrees to these Terms on your behalf
            </li>
            <li>Have the legal capacity to enter into a binding contract under Indian law</li>
            <li>Not be prohibited from using the Platform under applicable law</li>
            <li>Provide accurate and complete registration information</li>
          </ul>
          <p>
            We reserve the right to refuse registration, suspend, or terminate accounts
            that do not meet these eligibility requirements or that violate these Terms.
          </p>
        </>
      ),
    },
    {
      id: "account",
      title: "Account Registration & Security",
      content: (
        <>
          <p>
            To access certain features, you must create an account using a valid email
            address and password, or through a supported third-party authentication
            provider (such as Google SSO). You agree to:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your login credentials confidential and secure</li>
            <li>Notify us immediately of any unauthorized access to your account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>
          <p>
            We are not liable for any loss or damage arising from your failure to
            safeguard your account credentials. We may suspend or disable accounts that
            appear to be compromised or used in violation of these Terms.
          </p>
          <p>
            Each individual may maintain only one personal account unless expressly
            authorized by us. Creating multiple accounts to manipulate rankings,
            circumvent restrictions, or engage in fraudulent activity is prohibited.
          </p>
        </>
      ),
    },
    {
      id: "platform-description",
      title: "Description of the Platform",
      content: (
        <>
          <p>
            {PRODUCT} is a pickleball-focused sports technology platform that enables
            users to score matches, manage tournaments, track player statistics and
            rankings, discover clubs, and connect with the pickleball community in
            India and beyond.
          </p>
          <p>Core features include, but are not limited to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Match setup and live scoring (rally and side-out scoring)</li>
            <li>Tournament creation, registration, and bracket management</li>
            <li>Player dashboards, performance analytics, and leaderboards</li>
            <li>Club listings and club management tools</li>
            <li>Spectator viewing of public matches and tournaments</li>
            <li>Payment processing for tournament entry fees via Razorpay</li>
          </ul>
          <p>
            We reserve the right to modify, suspend, or discontinue any feature of the
            Platform at any time, with or without notice. We do not guarantee
            uninterrupted or error-free operation of the Platform.
          </p>
        </>
      ),
    },
    {
      id: "user-conduct",
      title: "User Conduct & Acceptable Use",
      content: (
        <>
          <p>
            You agree to use the Platform only for lawful purposes and in accordance with
            these Terms. You shall not:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Violate any applicable local, state, national, or international law or regulation</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation</li>
            <li>Submit false match results, manipulate rankings, or engage in match-fixing</li>
            <li>Harass, abuse, threaten, or discriminate against other users</li>
            <li>Upload or transmit viruses, malware, or other harmful code</li>
            <li>Attempt to gain unauthorized access to the Platform, other accounts, or our systems</li>
            <li>Scrape, crawl, or use automated means to access the Platform without our written consent</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
            <li>Use the Platform for commercial solicitation unrelated to authorized tournament or club activities</li>
            <li>Collect or harvest personal data of other users without their consent</li>
            <li>Interfere with or disrupt the integrity or performance of the Platform</li>
            <li>Circumvent any access controls, rate limits, or security measures</li>
          </ul>
          <p>
            We reserve the right to investigate violations and take appropriate action,
            including removing content, suspending accounts, and reporting unlawful
            activity to law enforcement authorities.
          </p>
        </>
      ),
    },
    {
      id: "user-content",
      title: "User Content & License",
      content: (
        <>
          <p>
            You may submit, upload, or display content on the Platform, including profile
            information, match data, tournament details, club information, images, and
            communications (&quot;User Content&quot;). You retain ownership of your User
            Content, subject to the licenses granted below.
          </p>
          <p>
            By submitting User Content, you grant {COMPANY} a non-exclusive, worldwide,
            royalty-free, sublicensable license to use, store, display, reproduce,
            modify (for formatting purposes), and distribute your User Content solely for
            the purpose of operating, providing, improving, and promoting the Platform
            and the pickleball community features described herein.
          </p>
          <p>You represent and warrant that:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>You own or have the necessary rights to submit the User Content</li>
            <li>Your User Content does not infringe any third-party intellectual property or privacy rights</li>
            <li>Your User Content complies with these Terms and applicable law</li>
          </ul>
          <p>
            We may remove User Content that violates these Terms or applicable law, or
            that we reasonably believe may expose us or other users to harm or liability.
            We are not obligated to monitor User Content but reserve the right to do so.
          </p>
        </>
      ),
    },
    {
      id: "organizer-terms",
      title: "Organizer, Referee & Club Owner Responsibilities",
      content: (
        <>
          <p>
            Users with elevated roles — including organizers, referees, club owners, and
            administrators — have additional responsibilities:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Ensure tournament rules, fees, schedules, and prize information are
              accurately communicated to participants
            </li>
            <li>
              Record match results fairly and accurately; disputes should be resolved in
              good faith between participants
            </li>
            <li>
              Comply with all applicable laws regarding event organization, taxation, and
              consumer protection
            </li>
            <li>
              Obtain necessary permissions, licenses, and insurance for events you
              organize through the Platform
            </li>
            <li>
              Handle participant personal data in accordance with our Privacy Policy and
              the DPDP Act; do not misuse participant information for unrelated purposes
            </li>
            <li>
              Respond promptly to participant inquiries regarding tournaments and events
              you manage
            </li>
          </ul>
          <p>
            {COMPANY} provides technology tools for event management but is not the
            organizer of user-created tournaments unless explicitly stated. Organizers
            are solely responsible for their events, including cancellations, refunds,
            and participant disputes, except where we expressly assume such responsibility
            in writing.
          </p>
        </>
      ),
    },
    {
      id: "payments",
      title: "Payments, Fees & Refunds",
      content: (
        <>
          <p>
            Certain features, including tournament registration, may require payment of
            fees. All payments are processed through our third-party payment partner,
            Razorpay. By making a payment, you also agree to Razorpay&apos;s applicable
            terms and conditions.
          </p>
          <p>
            <strong className="text-foreground">Pricing:</strong> Fees are displayed at
            the time of registration or purchase. All amounts are in Indian Rupees (INR)
            unless otherwise stated. Applicable taxes (including GST) may be added as
            required by law.
          </p>
          <p>
            <strong className="text-foreground">Refunds:</strong> Refund eligibility is
            determined by the tournament organizer&apos;s stated refund policy and
            applicable consumer protection laws. {COMPANY} does not guarantee refunds for
            tournament entry fees unless explicitly stated for a specific event. Refund
            requests should be directed to the relevant organizer in the first instance,
            with escalation to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            if unresolved.
          </p>
          <p>
            <strong className="text-foreground">Chargebacks:</strong> Initiating
            fraudulent chargebacks or payment disputes may result in account suspension.
            We reserve the right to recover amounts owed and associated processing fees.
          </p>
          <p>
            We may introduce subscription plans, premium features, or other paid services
            in the future. Any such offerings will be subject to separate pricing terms
            disclosed at the time of purchase.
          </p>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      content: (
        <>
          <p>
            The Platform, including its design, layout, software, code, logos, trademarks,
            trade names, graphics, and documentation (excluding User Content), is owned by
            or licensed to {COMPANY} and is protected by copyright, trademark, and other
            intellectual property laws of India and international treaties.
          </p>
          <p>
            &quot;PickleBuzz&quot; and associated logos are trademarks of {COMPANY}. You
            may not use our trademarks without prior written consent.
          </p>
          <p>
            Subject to your compliance with these Terms, we grant you a limited,
            non-exclusive, non-transferable, revocable license to access and use the
            Platform for your personal, non-commercial use (or for authorized
            organizational use as a club or tournament organizer).
          </p>
          <p>
            You may not copy, modify, distribute, sell, lease, or create derivative works
            based on the Platform or any part thereof without our express written
            permission.
          </p>
        </>
      ),
    },
    {
      id: "privacy",
      title: "Privacy & Data Protection",
      content: (
        <>
          <p>
            Your use of the Platform is also governed by our{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            , which explains how we collect, use, and protect your personal data in
            accordance with the Digital Personal Data Protection Act, 2023 (India) and
            other applicable laws.
          </p>
          <p>
            By using the Platform, you consent to the collection and processing of your
            personal data as described in the Privacy Policy. For data protection
            inquiries, contact{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline">
              {PRIVACY_EMAIL}
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      content: (
        <>
          <p>
            THE PLATFORM IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
            BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR
            STATUTORY, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, AND ACCURACY.
          </p>
          <p>
            Without limiting the foregoing, we do not warrant that:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>The Platform will be uninterrupted, secure, or error-free</li>
            <li>Match scores, rankings, or statistics will be accurate or complete</li>
            <li>User-created tournaments or events will proceed as scheduled</li>
            <li>Defects will be corrected within any particular timeframe</li>
          </ul>
          <p>
            {PRODUCT} is a technology platform for sports scoring and community
            engagement. We are not a sports governing body, event insurer, or guarantor
            of tournament outcomes. Participation in physical sports activities carries
            inherent risks of injury; you participate at your own risk.
          </p>
          <p>
            Any material downloaded or obtained through the Platform is accessed at your
            own discretion and risk. You are solely responsible for any damage to your
            device or loss of data resulting from such access.
          </p>
        </>
      ),
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      content: (
        <>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {COMPANY.toUpperCase()},
            ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR
            PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL,
            OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Your access to or use of (or inability to access or use) the Platform</li>
            <li>Any conduct or content of third parties on the Platform</li>
            <li>Unauthorized access to or alteration of your data</li>
            <li>Tournament cancellations, disputes, or organizer actions</li>
            <li>Personal injury or property damage arising from sports participation</li>
          </ul>
          <p>
            IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING
            OUT OF OR RELATING TO THESE TERMS OR THE PLATFORM EXCEED THE GREATER OF (A)
            THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR
            (B) INR 5,000 (FIVE THOUSAND INDIAN RUPEES).
          </p>
          <p>
            Some jurisdictions do not allow the exclusion or limitation of certain
            warranties or liabilities. In such cases, our liability shall be limited to
            the fullest extent permitted by applicable law, including the Consumer
            Protection Act, 2019, where applicable.
          </p>
        </>
      ),
    },
    {
      id: "indemnification",
      title: "Indemnification",
      content: (
        <>
          <p>
            You agree to indemnify, defend, and hold harmless {COMPANY}, its directors,
            officers, employees, agents, and affiliates from and against any claims,
            liabilities, damages, losses, costs, and expenses (including reasonable
            legal fees) arising out of or related to:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Your use of the Platform or violation of these Terms</li>
            <li>Your User Content or any content you submit</li>
            <li>Your organization or management of tournaments, clubs, or events</li>
            <li>Your violation of any third-party rights, including intellectual property or privacy rights</li>
            <li>Any dispute between you and another user</li>
          </ul>
          <p>
            We reserve the right to assume exclusive defense and control of any matter
            subject to indemnification by you, in which case you agree to cooperate with
            our defense.
          </p>
        </>
      ),
    },
    {
      id: "termination",
      title: "Suspension & Termination",
      content: (
        <>
          <p>
            You may terminate your account at any time by contacting us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            or through account settings where available.
          </p>
          <p>
            We may suspend or terminate your access to the Platform, with or without
            notice, if we reasonably believe that you have:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Violated these Terms or applicable law</li>
            <li>Engaged in fraudulent, abusive, or harmful conduct</li>
            <li>Created risk or legal exposure for us or other users</li>
            <li>Failed to pay applicable fees when due</li>
          </ul>
          <p>
            Upon termination, your right to use the Platform ceases immediately. Provisions
            that by their nature should survive termination — including intellectual
            property, disclaimers, limitation of liability, indemnification, and governing
            law — shall survive.
          </p>
          <p>
            We may retain certain data as required by law or for legitimate business
            purposes as described in our Privacy Policy, even after account termination.
          </p>
        </>
      ),
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution & Governing Law",
      content: (
        <>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of
            India, without regard to conflict of law principles.
          </p>
          <p>
            In the event of any dispute, controversy, or claim arising out of or relating
            to these Terms or the Platform, the parties shall first attempt to resolve the
            matter amicably through good-faith negotiation for a period of thirty (30)
            days from written notice of the dispute.
          </p>
          <p>
            If the dispute is not resolved through negotiation, it shall be referred to
            arbitration in accordance with the Arbitration and Conciliation Act, 1996. The
            arbitration shall be conducted by a sole arbitrator appointed by mutual
            agreement of the parties, or failing agreement, in accordance with the Act.
            The seat and venue of arbitration shall be in India. The language of
            arbitration shall be English.
          </p>
          <p>
            Notwithstanding the above, either party may seek injunctive or equitable
            relief in a court of competent jurisdiction in India to protect intellectual
            property rights or prevent unauthorized access.
          </p>
          <p>
            Subject to the arbitration clause above, the courts in India shall have
            exclusive jurisdiction over matters not subject to arbitration, to the extent
            permitted by law.
          </p>
        </>
      ),
    },
    {
      id: "consumer-rights",
      title: "Consumer Rights",
      content: (
        <>
          <p>
            Nothing in these Terms limits or excludes your statutory rights as a consumer
            under the Consumer Protection Act, 2019, or other mandatory applicable laws
            in India. If any provision of these Terms is found to be unenforceable or
            contrary to mandatory consumer protection law, that provision shall be
            modified to the minimum extent necessary or severed, and the remaining
            provisions shall continue in full force and effect.
          </p>
          <p>
            Consumers may file complaints with the National Consumer Helpline or the
            appropriate Consumer Disputes Redressal Commission in accordance with
            applicable law.
          </p>
        </>
      ),
    },
    {
      id: "changes",
      title: "Changes to These Terms",
      content: (
        <>
          <p>
            We may revise these Terms from time to time. When we make material changes,
            we will post the updated Terms on the Platform with a revised &quot;Last
            updated&quot; date and, where appropriate, notify you via email or in-app
            notification.
          </p>
          <p>
            Your continued use of the Platform after the effective date of revised Terms
            constitutes your acceptance of the changes. If you do not agree to the revised
            Terms, you must stop using the Platform and may request account deletion.
          </p>
        </>
      ),
    },
    {
      id: "miscellaneous",
      title: "Miscellaneous",
      content: (
        <>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Entire Agreement:</strong> These Terms,
              together with the Privacy Policy, constitute the entire agreement between
              you and {COMPANY} regarding the Platform.
            </li>
            <li>
              <strong className="text-foreground">Severability:</strong> If any provision
              is held invalid or unenforceable, the remaining provisions remain in effect.
            </li>
            <li>
              <strong className="text-foreground">Waiver:</strong> Our failure to enforce
              any right or provision shall not constitute a waiver of that right.
            </li>
            <li>
              <strong className="text-foreground">Assignment:</strong> You may not assign
              your rights under these Terms without our consent. We may assign our rights
              in connection with a merger, acquisition, or sale of assets.
            </li>
            <li>
              <strong className="text-foreground">Force Majeure:</strong> We are not
              liable for delays or failures caused by events beyond our reasonable control,
              including natural disasters, pandemics, government actions, or internet
              outages.
            </li>
            <li>
              <strong className="text-foreground">Notices:</strong> We may provide notices
              via email, in-app messages, or posting on the Platform. You may contact us
              at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      content: (
        <>
          <p>
            For questions about these Terms, please contact:
          </p>
          <p>
            <strong className="text-foreground">{COMPANY}</strong>
            <br />
            Platform: {PRODUCT}
            <br />
            Website:{" "}
            <a href={WEBSITE} className="text-primary hover:underline">
              {WEBSITE}
            </a>
            <br />
            Email:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </>
      ),
    },
  ],
};
