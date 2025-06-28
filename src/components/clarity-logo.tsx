import Image from 'next/image';

export function ClarityLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/clarity-logo.svg" alt="Clarity Logo" width={28} height={28} />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Clarity
      </span>
    </div>
  );
}
