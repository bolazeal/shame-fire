
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { EditProfileForm } from './edit-profile-form';
import type { User } from '@/lib/types';

interface EditProfileDialogProps {
  children: React.ReactNode;
  user: User;
  onProfileUpdate: (updatedUser: Partial<User>) => void;
}

export function EditProfileDialog({
  children,
  user,
  onProfileUpdate,
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (updatedUser: Partial<User>) => {
    onProfileUpdate(updatedUser);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditProfileForm user={user} onSave={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
