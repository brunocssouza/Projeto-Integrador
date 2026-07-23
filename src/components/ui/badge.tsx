import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-on-primary",
        secondary: "border-transparent bg-secondary text-on-secondary",
        success: "border-transparent bg-[#16a34a] text-white",
        warning: "border-transparent bg-[#f59e0b] text-[#1f1300]",
        danger: "border-transparent bg-error text-on-error",
        outline: "border-outline-variant text-on-surface",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
