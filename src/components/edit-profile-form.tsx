'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { UserAvatar } from './user-avatar';
import Image from 'next/image';
import { updateProfileAction } from '@/lib/actions/user';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  bio: z
    .string()
    .max(160, {
      message: 'Bio must not be longer than 160 characters.',
    })
    .optional(),
  location: z.string().max(50, { message: 'Location must not be longer than 50 characters.'}).optional(),
  website: z.string().url({ message: 'Please enter a valid URL.'}).optional().or(z.literal('')),
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  user: User;
  onSave: (updatedUser: ProfileFormValues) => void;
}

export function EditProfileForm({ user, onSave }: EditProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      avatarUrl: user.avatarUrl || '',
      bannerUrl: user.bannerUrl || '',
    },
    mode: 'onChange',
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'avatarUrl' | 'bannerUrl'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(field, reader.result as string, {
          shouldDirty: true,
          shouldValidate: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      await updateProfileAction(user.id, data);
      onSave(data);
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not save your profile changes.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const watchedAvatarUrl = form.watch('avatarUrl');
  const watchedBannerUrl = form.watch('bannerUrl');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Banner Image Input */}
        <div className="space-y-2">
          <FormLabel>Banner Image</FormLabel>
          <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted">
            <Image
              src={watchedBannerUrl || 'https://placehold.co/1200x400.png'}
              alt="Banner preview"
              layout="fill"
              objectFit="cover"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              onClick={() => bannerInputRef.current?.click()}
            >
              <Camera />
            </Button>
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'bannerUrl')}
            />
          </div>
        </div>

        {/* Avatar Image Input */}
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <div className="relative mx-auto h-24 w-24">
                <UserAvatar
                  user={{ ...user, avatarUrl: watchedAvatarUrl }}
                  className="h-24 w-24"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera />
                </Button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'avatarUrl')}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., San Francisco, CA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://your-website.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting || !form.formState.isDirty}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </Form>
  );
}
