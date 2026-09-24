import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.#{}]:bg-background group-[.#{}]:text-foreground group-[.#{}]:border-border group-[.#{}]:shadow-lg",
          description: "group-[.#{}]:text-muted-foreground",
          actionButton:
            "group-[.#{}]:bg-primary group-[.#{}]:text-primary-foreground",
          cancelButton:
            "group-[.#{}]:bg-muted group-[.#{}]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }