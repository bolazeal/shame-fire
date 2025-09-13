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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const settingsFormSchema = z.object({
  platformName: z.string().min(1, "Platform name cannot be empty."),
  platformDescription: z.string(),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string(),
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  defaultTrustScore: z.number().min(0).max(100),
  minimumTrustScore: z.number().min(0).max(100),
  maximumTrustScore: z.number().min(0).max(100),
  maxPostLength: z.number().min(10).max(10000),
  allowAnonymousPosts: z.boolean(),
  moderateNewUserContent: z.boolean(),
  autoFlagThreshold: z.number().min(1).max(100),
  enableAiModeration: z.boolean(),
  aiModerationSensitivity: z.enum(['low', 'medium', 'high']),
  flaggedContentRetentionDays: z.number().min(1),
  featureShameTv: z.boolean(),
  featureVillageSquare: z.boolean(),
  featureHallOfHonour: z.boolean(),
  featureDirectMessages: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

function SectionSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}


export function SettingsForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {},
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
        <div className="space-y-6">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic platform configuration and branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="platformName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Platform Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="platformDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Platform Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Maintenance Mode</FormLabel>
                            <FormDescription>
                            Enable to temporarily disable platform access for maintenance.
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
                    name="maintenanceMessage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Maintenance Message</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>User Settings</CardTitle>
                <CardDescription>Configure user registration, verification, and trust score settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="allowRegistration"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Allow Registration</FormLabel>
                            <FormDescription>
                            Allow new users to register on the platform.
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
                    name="requireEmailVerification"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Email Verification</FormLabel>
                            <FormDescription>
                            Require users to verify their email before accessing the platform.
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
                    name="defaultTrustScore"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Default Trust Score</FormLabel>
                        <FormControl>
                            <Input type="number" className="w-40" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>Configure content creation and moderation settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="maxPostLength"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Maximum Post Length</FormLabel>
                        <FormControl>
                            <Input type="number" className="w-40" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                        </FormControl>
                        <FormDescription>Maximum number of characters allowed in a post.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="allowAnonymousPosts"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Allow Anonymous Posts</FormLabel>
                            <FormDescription>
                            Allow users to post anonymously or as whistleblowers.
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
                    name="autoFlagThreshold"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Auto-Flag Threshold</FormLabel>
                        <FormControl>
                            <Input type="number" className="w-40" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                        </FormControl>
                        <FormDescription>Number of flags required to automatically hide content.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Moderation Settings</CardTitle>
                <CardDescription>Configure AI moderation and content review settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="enableAiModeration"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable AI Moderation</FormLabel>
                            <FormDescription>
                            Use AI to automatically detect and flag inappropriate content.
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
                    name="aiModerationSensitivity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>AI Moderation Sensitivity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select sensitivity" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>A higher sensitivity will flag more content.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="flaggedContentRetentionDays"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Flagged Content Retention (Days)</FormLabel>
                        <FormControl>
                            <Input type="number" className="w-40" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                        </FormControl>
                        <FormDescription>How long to keep flagged content before automatic deletion.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable platform features.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="featureShameTv"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel>Shame TV</FormLabel>
                            <FormDescription>Enable video content section.</FormDescription>
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
                    name="featureVillageSquare"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel>Village Square</FormLabel>
                            <FormDescription>Enable community disputes.</FormDescription>
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
                    name="featureHallOfHonour"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel>Hall of Honour</FormLabel>
                            <FormDescription>Enable user recognition system.</FormDescription>
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
                    name="featureDirectMessages"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel>Direct Messages</FormLabel>
                            <FormDescription>Enable private messaging.</FormDescription>
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
            </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Settings
        </Button>
      </form>
    </Form>
  );
}

    