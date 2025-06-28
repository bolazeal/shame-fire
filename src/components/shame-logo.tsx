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
        <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm1,14.36V18H11V16.36a2,2,0,0,1-2-2V12.5a2,2,0,0,1,2-2h.5a2,2,0,0,1,2,2v.5h-2v-.5a.5.5,0,0,0-.5-.5h-.5a.5.5,0,0,0-.5.5v1.86l.29.15a2,2,0,0,1,1.21,1.85Zm3.94-4.83-1.2,1.2A10.89,10.89,0,0,0,13,13.25V12.5a4,4,0,0,0-4-4H8.5a4,4,0,0,0-4,4v1.86a4,4,0,0,0,2.44,3.67L7,18.5V20H9.5v-1.5l.06,0a12.11,12.11,0,0,1,4-1.28,1,1,0,0,0,1-1V12.8A1,1,0,0,0,16.94,11.53Z" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Shame
      </span>
    </div>
  );
}
