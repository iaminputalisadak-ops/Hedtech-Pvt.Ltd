import StaticPage from './StaticPage'

export default function PrivacyPolicy() {
  return (
    <StaticPage
      title="Privacy Policy"
      description="How Hedztech handles information when you use this website."
      path="/privacy"
    >
      <p>
        This policy describes how we collect, use, and protect information submitted through this site (for example, contact forms)
        and technical data such as basic server logs. We do not sell your personal data.
      </p>
      <h2>Who we are</h2>
      <p>
        <strong>Hedztech</strong> (“we”, “us”, “our”) operates this website and provides digital services such as web development,
        UI/UX design, SEO, and related consulting. This Privacy Policy explains what we collect, why we collect it, and the choices
        you have.
      </p>

      <h2>Information we collect</h2>
      <p>We may collect the following types of information:</p>
      <ul>
        <li>
          <strong>Information you provide</strong>: When you contact us (e.g., through a form), you may provide your name, email
          address, phone number, company name, and message content.
        </li>
        <li>
          <strong>Technical information</strong>: When you use the site, our servers may automatically log data such as your IP
          address, browser type, device information, referring pages, pages visited, and timestamps. These logs help keep the site
          secure and reliable.
        </li>
        <li>
          <strong>Cookies and similar technologies</strong>: We may use cookies or similar tools to remember preferences and
          understand how the site is used. You can control cookies through your browser settings.
        </li>
      </ul>

      <h2>How we use information</h2>
      <p>We use collected information to:</p>
      <ul>
        <li>Respond to inquiries and provide requested information or services</li>
        <li>Communicate about proposals, projects, support, and account-related topics (if applicable)</li>
        <li>Maintain, secure, and improve the website and our services</li>
        <li>Detect and prevent spam, abuse, or other security incidents</li>
        <li>Comply with legal obligations and enforce our terms</li>
      </ul>

      <h2>Legal bases (where applicable)</h2>
      <p>
        Where required by law, we process personal data based on one or more of the following legal bases: your consent, performance
        of a contract or pre-contract steps, our legitimate interests (such as site security and service improvement), and compliance
        with legal obligations.
      </p>

      <h2>Sharing of information</h2>
      <p>We may share information in limited circumstances:</p>
      <ul>
        <li>
          <strong>Service providers</strong>: We may use trusted vendors (hosting, email delivery, analytics, etc.) to run the site
          and provide services. They are permitted to process data only on our instructions.
        </li>
        <li>
          <strong>Legal requirements</strong>: We may disclose information if required by law, court order, or to protect rights,
          safety, and security.
        </li>
        <li>
          <strong>Business transfers</strong>: If we undergo a merger, acquisition, or asset sale, information may be transferred as
          part of that transaction.
        </li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>Data retention</h2>
      <p>
        We keep personal information only as long as necessary for the purposes described above, including responding to requests,
        maintaining records, meeting legal obligations, and resolving disputes. Retention periods may vary depending on the type of
        data and how it is used.
      </p>

      <h2>Security</h2>
      <p>
        We use reasonable administrative, technical, and organizational safeguards designed to protect information. However, no method
        of transmission or storage is 100% secure, so we cannot guarantee absolute security.
      </p>

      <h2>Your choices & rights</h2>
      <p>
        Depending on your location, you may have rights to request access, correction, deletion, or portability of your personal
        information, and to object to or restrict certain processing. You may also withdraw consent where processing is based on
        consent.
      </p>
      <p>
        To make a request, contact us using the details below. We may ask for information to verify your identity before responding.
      </p>

      <h2>International transfers</h2>
      <p>
        If you access the site from outside the country where our servers or service providers are located, your information may be
        transferred across borders. Where required, we use appropriate safeguards for such transfers.
      </p>

      <h2>Children’s privacy</h2>
      <p>
        Our services are not directed to children, and we do not knowingly collect personal information from children. If you believe
        a child has provided us personal information, contact us and we will take appropriate steps.
      </p>

      <h2>Third-party links</h2>
      <p>
        The site may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to
        review their policies before providing personal information.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We will post the latest version on this page and update the effective date below.
      </p>
      <p>
        <strong>Effective date:</strong> {new Date().toLocaleDateString()}
      </p>

      <h2>Contact us</h2>
      <p>
        If you have questions or requests about this Privacy Policy, contact us at <strong>hedztechpvtltd@gmail.com</strong>.
      </p>
    </StaticPage>
  )
}
