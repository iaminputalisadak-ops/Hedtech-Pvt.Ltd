import StaticPage from './StaticPage'

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms & Conditions"
      description="Terms of use for the Hedztech website."
      path="/terms"
    >
      <p>
        These terms govern your use of this website and its content. By using the site, you agree to these terms in their current
        form.
      </p>
      <p>
        Replace this placeholder with your full terms, including limitations of liability, intellectual property, and governing law,
        as appropriate for your business.
      </p>
    </StaticPage>
  )
}
