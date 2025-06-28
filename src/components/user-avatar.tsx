import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={cn('h-12 w-12', className)}>
      <AvatarImage asChild src={user.avatarUrl}>
        <Image
          src={user.avatarUrl}
          alt={user.name}
          width={48}
          height={48}
          className="aspect-square h-full w-full"
          data-ai-hint={user['data-ai-hint']}
        />
      </AvatarImage>
      <AvatarFallback>
        {user.name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </AvatarFallback>
    </Avatar>
  );
}
