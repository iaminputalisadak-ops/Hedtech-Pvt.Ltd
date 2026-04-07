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
      <p>
        Replace this placeholder with your full privacy policy. Consult a qualified advisor to ensure compliance with applicable laws
        (GDPR, CCPA, etc.) for your jurisdiction and services.
      </p>
    </StaticPage>
  )
}
