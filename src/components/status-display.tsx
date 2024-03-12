import { type Status } from "@/components/admin-table/rows";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

const statusToIcon = {
  idle: CircleIcon,
  pending: StopwatchIcon,
  success: CheckCircledIcon,
  error: CrossCircledIcon,
} as const;

const statusToVariant = {
  idle: "secondary",
  pending: "warning",
  success: "success",
  error: "destructive",
} as const;

export interface StatusDisplayProps extends BadgeProps {
  status: Status;
  statusReason?: string;
  children?: React.ReactNode;
}

export function StatusDisplay(props: StatusDisplayProps) {
  const { status, ...badgeProps } = props;
  const StatusIcon = statusToIcon[status];
  const statusColor = statusToVariant[status];

  return (
    <Badge
      variant={statusColor}
      {...badgeProps}
      className={cn("flex items-center space-x-1 ", props.className)}
    >
      <StatusIcon className="h-4 w-4" />
      <span className="capitalize">{status}</span>
      {props.children}
    </Badge>
  );
}
