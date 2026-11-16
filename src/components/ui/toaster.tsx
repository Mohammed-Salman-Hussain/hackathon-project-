import { Toaster as Sonner } from 'sonner';

/** App-wide toast host. Call `toast()` from 'sonner' anywhere. */
export function Toaster({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <Sonner
      theme={theme}
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: '!rounded-xl !border !bg-surface-2 !text-text !shadow-card !font-sans',
          description: '!text-muted',
        },
      }}
    />
  );
}
