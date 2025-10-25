import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  return (
    <div
      className={cn(
        'bg-white overflow-hidden shadow rounded-lg',
        hover && 'transition-shadow duration-200 hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div
      className={cn('px-4 py-5 sm:px-6 border-b border-gray-200', className)}
    >
      {children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return <div className={cn('px-4 py-5 sm:p-6', className)}>{children}</div>;
};

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
};

const CardWithComponents = Card as typeof Card & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

CardWithComponents.Header = CardHeader;
CardWithComponents.Body = CardBody;
CardWithComponents.Footer = CardFooter;

export default CardWithComponents;
