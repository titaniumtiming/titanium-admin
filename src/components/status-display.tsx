import { type Status } from "@/components/admin-table/rows";
import { Badge } from "@/components/ui/badge";
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

export interface StatusDisplayProps {
  status: Status;
  statusReason?: string;
}

export function StatusDisplay(props: StatusDisplayProps) {
  const { status } = props;
  const StatusIcon = statusToIcon[status];
  const statusColor = statusToVariant[status];

  return (
    <Badge variant={statusColor} className="flex items-center space-x-1 ">
      <StatusIcon className="h-4 w-4" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
}
