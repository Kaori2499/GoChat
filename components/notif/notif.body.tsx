import { cn } from "@/lib/utils";

import type { NotifBodyProps } from "./notif.types";

const NotifBody = ({ className, children, ...props }: NotifBodyProps) => (
  <div
    data-slot="notif-body"
    className={cn("relative z-10 flex w-full flex-col px-3 pb-6", className)}
    {...props}
  >
    {children}
  </div>
);

NotifBody.displayName = "Notif.Body";

export { NotifBody };
