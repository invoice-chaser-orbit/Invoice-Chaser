import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const icButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-600 active:scale-95",
        secondary:
          "bg-neutral-900 text-white hover:bg-black active:scale-95",
        outlined:
          "bg-transparent border border-neutral-300 text-neutral-900 hover:border-primary-500 hover:text-primary-500",
        ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
      },
      size: {
        md: "px-5 py-3 text-[15px] leading-6",
        sm: "px-4 py-2 text-[13px] leading-5",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface IcButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof icButtonVariants> {
  asChild?: boolean;
}

export function IcButton({
  className,
  variant,
  size,
  asChild,
  ...props
}: IcButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(icButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { icButtonVariants };
