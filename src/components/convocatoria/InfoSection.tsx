import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoSectionProps {
  title: string;
  content: string;
  icon?: LucideIcon;
  variant?: 'default' | 'highlight';
}

const InfoSection = ({ title, content, icon: Icon, variant = 'default' }: InfoSectionProps) => {
  const isHighlight = variant === 'highlight';
  
  return (
    <Card className={cn(
      "shadow-card border-border/50",
      isHighlight && "bg-primary/5 border-primary/20"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          {Icon && <Icon className={cn("h-5 w-5", isHighlight ? "text-primary" : "text-accent")} />}
          <span className={cn(
            "px-4 py-1.5 rounded-full text-sm font-semibold",
            isHighlight 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-foreground"
          )}>
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
};

export default InfoSection;
