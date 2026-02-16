import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="rounded-[24px] bg-white p-8 shadow-lg shadow-black/5 ring-1 ring-black/[0.04] sm:rounded-[28px] sm:p-12">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Terms of Service
          </h1>
          <p className="mb-10 text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>

          <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using EZ Charts, you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do
                not use our services.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                2. Description of Service
              </h2>
              <p>
                EZ Charts provides AI-powered data visualization tools that
                allow users to create charts, graphs, and presentations. Our
                services include chat-based chart generation, manual editing,
                and slide deck creation.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                3. Account and Usage
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activity under your account. You
                agree to use the service only for lawful purposes and in
                compliance with these terms. You must not misuse the service,
                attempt to gain unauthorized access, or interfere with its
                operation.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                4. Intellectual Property
              </h2>
              <p>
                The EZ Charts platform, including its design, features, and
                underlying technology, is owned by us or our licensors. You
                retain ownership of the data and content you create. By using
                our service, you grant us a limited license to process your
                data as necessary to provide the service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                5. Subscription and Payments
              </h2>
              <p>
                Paid plans are billed according to the pricing displayed at the
                time of purchase. You may cancel your subscription at any time.
                Refunds are handled in accordance with our refund policy.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                6. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, EZ Charts shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of the service. Our total
                liability shall not exceed the amount you paid us in the twelve
                months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                7. Changes and Termination
              </h2>
              <p>
                We may modify these terms at any time. Continued use of the
                service after changes constitutes acceptance. We reserve the
                right to suspend or terminate access for violation of these
                terms.
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
