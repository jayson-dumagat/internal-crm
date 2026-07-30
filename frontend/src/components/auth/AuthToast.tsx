import { toast } from "sonner";
import Notification from "../ui/notification/Notfication";

interface AuthToastProps {
  toastId: string | number;
  variant: "success" | "error";
  title: string;
  description?: string;
}

export default function AuthToast({
  toastId,
  variant,
  title,
  description,
}: AuthToastProps) {
  return (
    <Notification
      variant={variant}
      title={title}
      description={description}
      onClose={() => toast.dismiss(toastId)}
    />
  );
}
