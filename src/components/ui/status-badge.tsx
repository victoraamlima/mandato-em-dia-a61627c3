import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "aberto" | "em-andamento" | "concluido" | "arquivado";
  className?: string;
}

const statusConfig = {
  aberto: {
    label: "Aberto",
    className: "status-aberto",
  },
  "em-andamento": {
    label: "Em Andamento",
    className: "status-em-andamento",
  },
  concluido: {
    label: "Concluído",
    className: "status-concluido",
  },
  arquivado: {
    label: "Arquivado",
    className: "bg-muted text-muted-foreground",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn("status-badge", config.className, className)}>
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: "baixa" | "media" | "alta" | "urgente";
  className?: string;
}

const priorityConfig = {
  baixa: {
    label: "Baixa",
    className: "priority-baixa",
  },
  media: {
    label: "Média",
    className: "priority-media",
  },
  alta: {
    label: "Alta",
    className: "priority-alta",
  },
  urgente: {
    label: "Urgente",
    className: "priority-alta animate-pulse",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  return (
    <span className={cn("status-badge", config.className, className)}>
      {config.label}
    </span>
  );
}