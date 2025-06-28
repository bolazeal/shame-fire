'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreatePostForm } from './create-post-form';
import { useState } from 'react';

interface CreatePostDialogProps {
  trigger: React.ReactNode;
}

export function CreatePostDialog({ trigger }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create a post</DialogTitle>
        </DialogHeader>
        <CreatePostForm onPostCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
