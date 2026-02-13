/** Tiny label + input wrapper reused across editor panels */
export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-medium text-[#3D4035]/50">{label}</span>
      {children}
    </div>
  );
}
