import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex px-4 py-3 items-center gap-2 backdrop-blur-xs transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default:
          "bg-button-primary-background text-button-primary-foreground hover:bg-button-primary-background-hover hover:text-button-primary-foreground-hover button-inset-shadow hover:button-inset-shadow-hover",
        ghost:
          "bg-button-ghost-background text-button-primary-foreground hover:bg-button-ghost-background-hover hover:text-button-primary-foreground-hover",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-md",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-full",
        full: "w-full h-9 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export const Button = ({ className, variant, size, children, ...props }: ButtonProps) => {
  return (
    <button data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
};
