import Image from 'next/image';

export function ShameLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="https://placehold.co/32x32.png"
        alt="Shame Logo"
        width={28}
        height={28}
        data-ai-hint="facepalm logo"
      />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Shame
      </span>
    </div>
  );
}
