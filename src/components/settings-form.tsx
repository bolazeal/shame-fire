
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPlatformSettings, updatePlatformSettings, type PlatformSettings } from '@/lib/settings';
import { Skeleton } from './ui/skeleton';

const settingsFormSchema = z.object({
  enableTrustScoreAi: z.boolean(),
  moderationTrustScoreThreshold: z.number().min(0).max(100),
  defaultStartingTrustScore: z.number().min(0).max(100),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function SettingsForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
        enableTrustScoreAi: true,
        moderationTrustScoreThreshold: 20,
        defaultStartingTrustScore: 50,
    },
  });

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await getPlatformSettings();
        form.reset(settings);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load platform settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [form, toast]);


  async function onSubmit(data: SettingsFormValues) {
    setIsSubmitting(true);
    try {
      await updatePlatformSettings(data);
      toast({
        title: 'Settings Saved',
        description: 'Your changes to the platform settings have been saved.',
      });
      form.reset(data); // This marks the form as no longer dirty
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save platform settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-10 w-20" />
            </div>
             <div className="space-y-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-8 w-full" />
            </div>
             <div className="space-y-4">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-10 w-40" />
            </div>
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="enableTrustScoreAi"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">AI Trust Score Calculation</FormLabel>
                <FormDescription>
                  Enable or disable AI-driven adjustments to user Trust Scores based on reports and endorsements.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="moderationTrustScoreThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moderation Bypass Trust Score</FormLabel>
              <FormDescription>
                Posts from users with a Trust Score above this value will bypass the AI moderation queue. Set to 100 to moderate all posts.
              </FormDescription>
              <FormControl>
                <div className="flex items-center gap-4">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="w-60"
                    />
                    <span className="font-bold text-lg text-primary">{field.value}</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultStartingTrustScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Starting Trust Score</FormLabel>
              <FormDescription>
                The initial Trust Score assigned to all new users upon signup.
              </FormDescription>
              <FormControl>
                <Input type="number" className="w-40" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </form>
    </Form>
  );
}
