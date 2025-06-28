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
        <path d="M14 17.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5m4.5-5.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5m-4.62-6.57L11.5 4H6v10h5.5l2-3.57c-1.04-.2-2.13-.33-3.25-.33C6.67 10.1 4 12.86 4 16.32V19h8.28c.48-1.03 1.2-1.94 2.1-2.68L12.5 13H8v-2h2.5l2-3.5L10.5 9H8V6h1.5l1.38 2.43zM15 4h5v5h-5z" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Shame
      </span>
    </div>
  );
}
