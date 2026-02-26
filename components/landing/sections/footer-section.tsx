import Image from "next/image";
import Link from "next/link";

export function FooterSection() {
  return (
    <footer className="border-t border-slate-100 bg-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900"
              >
                <div className="relative size-12 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="EZ Charts"
                    fill
                    className="object-contain z-10"
                  />
                </div>
                <Image
                  src="/EZ Charts.png"
                  alt="EZ Charts"
                  width={150}
                  height={80}
                  className="h-14 translate-x-[-50px] w-auto object-contain"
                />{" "}
              </Link>
            </div>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-500">
              Making data visualization accessible to everyone through the power
              of AI.
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900">
              Product
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li>
                <Link
                  href="#features"
                  className="transition-colors hover:text-[#6C5DD3]"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/ezcharts/examples"
                  className="transition-colors hover:text-[#6C5DD3]"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="transition-colors hover:text-[#6C5DD3]"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900">
              Company
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-[#6C5DD3]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-[#6C5DD3]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-slate-100 pt-8 text-xs font-bold uppercase tracking-wider text-slate-400 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} EZ Charts</p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="transition-colors hover:text-slate-600"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-slate-600"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
