import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-3.5" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // Theme tokens are HSL triplets, so wrap them; a bare var() left toasts see-through.
          "--normal-bg": "hsl(var(--popover))",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--border-radius": "var(--radius)",
          // Compact, centred toasts that leave room for the back and share buttons at the
          // top corners of the app's pages (phones use the 64px side offsets below).
          "--width": "260px",
        } as React.CSSProperties
      }
      mobileOffset={{ top: 12, left: 64, right: 64 }}
      toastOptions={{
        classNames: {
          toast: "!min-h-0 !gap-2 !rounded-2xl !px-3.5 !py-2.5 !text-xs !shadow-lg !shadow-black/25",
          title: "!text-xs !font-medium !leading-snug",
          description: "!text-[11px] !leading-snug",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
