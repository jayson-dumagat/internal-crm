import Notification from "../ui/notification/Notfication";
import { useToast } from "../../hooks/useToast";

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
  const { dismiss } = useToast();
  return (
    <Notification
      variant={variant}
      title={title}
      description={description}
      onClose={() => dismiss(toastId)}
    />
  );
}
