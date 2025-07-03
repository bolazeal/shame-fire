
export function ClarityLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 16C24 9.37258 18.6274 4 12 4C5.37258 4 0 9.37258 0 16C0 22.6274 5.37258 28 12 28C18.6274 28 24 22.6274 24 16Z"
          transform="translate(4, 0)"
          fill="hsl(var(--primary))"
        />
        <path
          d="M13.25 10H12V11.25V15.75V17H13.25H16.25H17.5V15.75V11.25V10H16.25H13.25ZM10.75 12.25H9.5V13.5V14.75V16H10.75V17.25V18.5H12V19.75V21H13.25V22.25H14.5V21H15.75V19.75H17V18.5V17.25H18.25V16V14.75V13.5H19.5V12.25H20.75V11H19.5V9.75H18.25V8.5H17V7.25H15.75V6H14.5V7.25H13.25V8.5H12V9.75H10.75V11V12.25Z"
          transform="translate(0, -1)"
          fill="hsl(var(--foreground))"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Shame
      </span>
    </div>
  );
}
