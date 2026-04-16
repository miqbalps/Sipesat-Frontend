import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]', className)}
      {...props}
    />
  );
});

const DialogContent = React.forwardRef(function DialogContent({ className, children, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl border bg-white p-6 text-slate-900 shadow-lg focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
        <DialogClose
          className="absolute right-4 top-4 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 text-left', className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}

const DialogTitle = React.forwardRef(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  );
});

const DialogDescription = React.forwardRef(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description ref={ref} className={cn('text-sm text-slate-500', className)} {...props} />
  );
});

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
