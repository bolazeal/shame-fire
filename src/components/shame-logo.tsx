import { Frown } from 'lucide-react';

export function ShameLogo() {
  return (
    <div className="flex items-center gap-2">
       <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width={28}
        height={28}
        fill="currentColor"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm7 10c0 1.93-1.57 3.5-3.5 3.5S12 13.93 12 12s1.57-3.5 3.5-3.5S19 10.07 19 12zm-9.85 4.34C6.56 15.66 5 14.08 5 12c0-2.37 1.93-4.32 4.3-4.48C9.17 6.56 8.18 6 7 6c-2.21 0-4 1.79-4 4s1.79 4 4 4c.85 0 1.63-.27 2.29-.73.22.61.59 1.15 1.06 1.62-.23.06-.47.09-.71.12zm1.85-2.09c.39-.39.39-1.02 0-1.41L10.59 12l1.41-1.41c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41L11.41 12l1.41 1.41c.39.39.39 1.02 0 1.41-.4.4-1.03.4-1.42.01z" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Shame
      </span>
    </div>
  );
}
