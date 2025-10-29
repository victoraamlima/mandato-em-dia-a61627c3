import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ElementType;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const ActionIcon = action?.icon || Plus;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {action && (
        <Button className="bg-primary hover:bg-primary-hover" asChild>
          <Link to={action.href}>
            <ActionIcon className="w-4 h-4 mr-2" />
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}