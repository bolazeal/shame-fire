import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User as AppUser } from '@/lib/types';
import type { User as FirebaseUser } from 'firebase/auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UserAvatarProps {
  user: AppUser | FirebaseUser;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const isAppUser = (user: AppUser | FirebaseUser): user is AppUser => {
    return (user as AppUser).username !== undefined;
  };

  const name = isAppUser(user) ? user.name : user.displayName || 'User';
  const avatarUrl = isAppUser(user) ? user.avatarUrl : user.photoURL;
  const dataAiHint = isAppUser(user) ? user['data-ai-hint'] : undefined;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <Avatar className={cn('h-12 w-12', className)}>
      {avatarUrl && (
        <AvatarImage asChild src={avatarUrl}>
          <Image
            src={avatarUrl}
            alt={name}
            width={48}
            height={48}
            className="aspect-square h-full w-full"
            data-ai-hint={dataAiHint}
          />
        </AvatarImage>
      )}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
