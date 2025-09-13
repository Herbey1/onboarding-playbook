import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, FileText, GitBranch, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  variant: "library" | "plan" | "projects" | "integrations" | "progress";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const AnimatedSVG = ({ variant }: { variant: EmptyStateProps["variant"] }) => {
  const variants = {
    floating: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    },
    bounce: {
      y: [0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const iconProps = {
    className: "w-16 h-16 text-primary/60",
    strokeWidth: 1.5
  };

  switch (variant) {
    case "library":
      return (
        <div className="relative">
          <motion.div
            animate="floating"
            variants={variants}
            className="relative"
          >
            <BookOpen {...iconProps} />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-2 -right-2 w-6 h-6 text-accent"
          >
            <FileText className="w-4 h-4" />
          </motion.div>
        </div>
      );
    
    case "plan":
      return (
        <motion.div
          animate="bounce"
          variants={variants}
          className="relative"
        >
          <CheckCircle2 {...iconProps} />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent/20 rounded-full flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
          </motion.div>
        </motion.div>
      );
    
    case "projects":
      return (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <Users {...iconProps} />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-2 -right-2"
          >
            <div className="w-3 h-3 bg-primary rounded-full" />
          </motion.div>
        </motion.div>
      );
    
    case "integrations":
      return (
        <motion.div
          animate="floating"
          variants={variants}
          className="relative"
        >
          <GitBranch {...iconProps} />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1 -right-1 w-4 h-4 border-2 border-accent border-t-transparent rounded-full"
          />
        </motion.div>
      );
    
    default:
      return <CheckCircle2 {...iconProps} />;
  }
};

export function EmptyState({ 
  variant, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="p-12 text-center border-dashed border-2 border-border hover-lift transition-all duration-300">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          className="flex justify-center mb-6"
        >
          <AnimatedSVG variant={variant} />
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-stepable-xl font-bold text-foreground mb-2"
        >
          {title}
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed"
        >
          {description}
        </motion.p>
        
        {actionLabel && onAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Button 
              onClick={onAction} 
              className="hover-scale transition-transform duration-200"
            >
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}