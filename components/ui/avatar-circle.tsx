import { cn } from "@/lib/utils";

const sizeMap = {
  44: { box: "h-11 w-11", text: "text-[16px]" },
  40: { box: "h-10 w-10", text: "text-[15px]" },
  36: { box: "h-9 w-9", text: "text-[13px]" },
  32: { box: "h-8 w-8", text: "text-[12px]" },
} as const;

export function AvatarCircle({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const s = sizeMap[size];
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (src) {
    return (
      <img src={src} alt={name} className={cn("rounded-full object-cover", s.box, className)} />
    );
  }

  return (
    <span
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-600",
        s.box,
        s.text,
        className,
      )}
    >
      {initials}
    </span>
  );
}
