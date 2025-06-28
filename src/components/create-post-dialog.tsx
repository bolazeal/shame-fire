'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreatePostForm, type createPostFormSchema } from './create-post-form';
import { useState } from 'react';
import type { z } from 'zod';

interface CreatePostDialogProps {
  trigger: React.ReactNode;
  initialValues?: Partial<z.infer<typeof createPostFormSchema>>;
  dialogTitle?: string;
}

export function CreatePostDialog({
  trigger,
  initialValues,
  dialogTitle,
}: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {dialogTitle || 'Create a post'}
          </DialogTitle>
        </DialogHeader>
        <CreatePostForm
          onPostCreated={() => setOpen(false)}
          initialValues={initialValues}
        />
      </DialogContent>
    </Dialog>
  );
}
