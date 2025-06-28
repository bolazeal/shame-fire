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
        <path d="M12.83,3.06C11.64,2.39,10.22,2,8.71,2c-3.23,0-5.92,2.1-6.61,5H1c-1.1,0-1.28.67-0.55,1.48C2.16,10.88,4.78,12,7.71,12h0.74c0.9,0,1.64,0.72,1.64,1.6v0.4h3.82v-0.4c0-0.88,0.74-1.6,1.64-1.6h0.74c2.93,0,5.55-1.12,7.26-3.52c0.73-0.81,0.55-1.48-0.55-1.48h-1.1c-0.69-2.9-3.38-5-6.61-5C13.88,2,13.2,2.15,12.83,3.06z M8,15h8v2H8V15z" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Shame
      </span>
    </div>
  );
}
