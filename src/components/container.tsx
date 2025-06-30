import { cn } from "@/lib/utils";
import { Children, isValidElement, cloneElement, ReactNode } from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className, ...props }: ContainerProps) {
  // Ensure we have valid children
  const validChildren = Children.toArray(children).filter(child => 
    isValidElement(child)
  );

  // If no valid children, return null or a fragment
  if (validChildren.length === 0) {
    return null;
  }

  // If only one child, wrap it in a div with the container classes
  if (validChildren.length === 1) {
    return (
      <div 
        className={cn(
          "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
          className
        )}
        {...props}
      >
        {validChildren[0]}
      </div>
    );
  }

  // If multiple children, wrap them in a fragment inside the container
  return (
    <div 
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {validChildren}
    </div>
  );
}
