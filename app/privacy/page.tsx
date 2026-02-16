import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="rounded-[24px] bg-white p-8 shadow-lg shadow-black/5 ring-1 ring-black/[0.04] sm:rounded-[28px] sm:p-12">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Privacy Policy
          </h1>
          <p className="mb-10 text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>

          <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                1. Information We Collect
              </h2>
              <p>
                We collect information you provide directly, including when you
                create an account, use our services, upload data, or contact us
                for support. This may include your name, email address, and any
                data you input or upload to create charts and visualizations.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                2. How We Use Your Information
              </h2>
              <p>
                We use your information to provide, maintain, and improve our
                services, process your requests, send you updates, and respond
                to support inquiries. We may also use aggregated, anonymized
                data for analytics and product development.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                3. Data Storage and Security
              </h2>
              <p>
                We store your data securely and take reasonable measures to
                protect it from unauthorized access. Data is retained for as
                long as your account is active or as needed to provide our
                services.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                4. Third-Party Services
              </h2>
              <p>
                We may use third-party services for hosting, analytics,
                authentication, and AI processing. These providers have their
                own privacy policies governing how they handle data. We
                recommend reviewing their policies.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                5. Your Rights
              </h2>
              <p>
                Depending on your location, you may have the right to access,
                correct, or delete your personal data. You can manage your
                account settings and contact us at any time to exercise these
                rights.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                6. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of significant changes by posting the updated policy
                on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>
          </div>

          <p className="mt-12 pt-8 text-center text-sm text-slate-500">
            Questions?{" "}
            <Link href="/contact" className="font-medium text-[#6C5DD3] hover:underline">
              Contact us
            </Link>
            {" · "}
            <Link href="/" className="font-medium text-[#6C5DD3] hover:underline">
              Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
