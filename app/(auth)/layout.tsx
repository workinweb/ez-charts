export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-white to-[#EDE9FE] p-6 sm:p-8">
      {children}
    </div>
  );
}
