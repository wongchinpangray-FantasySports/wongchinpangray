import { initials } from "@/lib/utils";

export function Avatar({
  name,
  color,
  size = 32,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      title={name}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.34,
      }}
      className="inline-flex items-center justify-center rounded-full font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
    >
      {initials(name)}
    </span>
  );
}
