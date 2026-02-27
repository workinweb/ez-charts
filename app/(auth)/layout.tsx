export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh min-h-screen items-center justify-center overflow-y-auto bg-gradient-to-br from-[#F5F3FF] via-white to-[#EDE9FE] p-4 py-6 sm:p-8">
      {children}
    </div>
  );
}
