
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { suggestCategoriesAction } from '@/lib/actions/ai';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import { createPostAction } from '@/lib/actions/post';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { createPostFormSchema } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const categories = [
    'Artisan', 
    'Institution', 
    'Employee', 
    'Government', 
    'Vendor', 
    'Employer', 
    'Public Figure', 
    'Person', 
    'Organization', 
    'Community', 
    'Online', 
    'other'
];

export function CreatePostForm({
  onPostCreated,
  initialValues,
}: {
  onPostCreated: () => void;
  initialValues?: Partial<z.infer<typeof createPostFormSchema>>;
}) {
  const [activeTab, setActiveTab] = useState<'report' | 'endorsement' | 'post'>(
    initialValues?.type || 'post'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestingCategories, setIsSuggestingCategories] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const { user, fullProfile } = useAuth();
  const [mediaPreview, setMediaPreview] = useState<{
    url: string;
    type: 'image' | 'video';
  } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const form = useForm<z.infer<typeof createPostFormSchema>>({
    resolver: zodResolver(createPostFormSchema),
    defaultValues: {
      type: 'post',
      postingAs: 'verified',
      entity: '',
      text: '',
      category: '',
      mediaUrl: '',
      mediaType: undefined,
      ...initialValues,
    },
  });

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({ url: reader.result as string, type });
        form.setValue('mediaUrl', reader.result as string);
        form.setValue('mediaType', type);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setMediaPreview(null);
    form.setValue('mediaUrl', '');
    form.setValue('mediaType', undefined);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleTabChange = (value: string) => {
    const newType = value as 'report' | 'endorsement' | 'post';
    setActiveTab(newType);
    form.reset({
      type: newType,
      postingAs: 'verified',
      entity: newType !== 'post' ? initialValues?.entity || '' : '',
      text: '',
      category: '',
    });
    form.clearErrors();
    setSuggestedCategories([]);
    clearMedia();
  };

  const handleSuggestCategories = async () => {
    const text = form.getValues('text');
    if (text.length < 20) {
      toast({
        title: 'Text too short',
        description:
          'Please write a more detailed description (at least 20 characters) for better category suggestions.',
        variant: 'destructive',
      });
      return;
    }
    setIsSuggestingCategories(true);
    setSuggestedCategories([]);
    try {
      const result = await suggestCategoriesAction({ reportText: text });
      setSuggestedCategories(result.suggestedCategories);
    } catch (error) {
      console.error('Failed to suggest categories:', error);
      toast({
        title: 'Error',
        description: 'Could not suggest categories at this time.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggestingCategories(false);
    }
  };

  async function onSubmit(values: z.infer<typeof createPostFormSchema>) {
    if (!user || !fullProfile) {
      toast({
        title: 'You must be logged in to post.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createPostAction(values, fullProfile);

      toast({
        title: 'Post created!',
        description: `Your ${values.type} has been successfully submitted.`,
      });
      onPostCreated();
    } catch (error: any) {
      if (error.message?.startsWith('MODERATION_FLAG:')) {
        const reason = error.message.split(':')[1];
        toast({
          title: 'Post Held for Review',
          description: `Our AI moderation has flagged this content: ${reason}. A human moderator will assess it shortly.`,
          variant: 'destructive',
        });
        onPostCreated(); // Close the dialog even if flagged
      } else {
        console.error('Failed to create post:', error);
        toast({
          title: 'Failed to create post',
          description:
            'An error occurred while submitting your post. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const getPlaceholder = () => {
    if (activeTab === 'report') return 'Describe the incident...';
    if (activeTab === 'endorsement')
      return 'Describe the positive experience...';
    return "What's happening?";
  };

  return (
    <Tabs
      value={activeTab}
      className="w-full"
      onValueChange={handleTabChange}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="post">Share Update</TabsTrigger>
        <TabsTrigger value="report">Report Misconduct</TabsTrigger>
        <TabsTrigger value="endorsement">Give Endorsement</TabsTrigger>
      </TabsList>
      <div className="pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {activeTab !== 'post' && (
              <FormField
                control={form.control}
                name="entity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {activeTab === 'report'
                        ? 'Who are you reporting?'
                        : 'Who are you endorsing?'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Company Name or Person's Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {activeTab !== 'post' && (
              <Collapsible open={isContactOpen} onOpenChange={setIsContactOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="link" className="p-0 text-sm">
                    Add Contact Information (Optional)
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${
                        isContactOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Provide this info if the person/entity isn't on this
                    platform. This helps us contact them about this post.
                  </p>
                  <FormField
                    control={form.control}
                    name="entityContactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity's Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entityContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity's Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1-555-123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entityContactSocialMedia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Entity's Social Media Profile URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://twitter.com/username"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={getPlaceholder()}
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="relative mt-2">
              {mediaPreview && (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 z-10 h-6 w-6 rounded-full"
                    onClick={clearMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {mediaPreview.type === 'image' ? (
                    <Image
                      src={mediaPreview.url}
                      alt="Preview"
                      width={500}
                      height={300}
                      className="max-h-60 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <video
                      src={mediaPreview.url}
                      controls
                      className="max-h-60 w-full rounded-lg"
                    />
                  )}
                </>
              )}
            </div>

            {activeTab !== 'post' && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(activeTab === 'report' || activeTab === 'endorsement') && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestCategories}
                  disabled={isSuggestingCategories}
                >
                  {isSuggestingCategories ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Suggest Categories with AI
                </Button>
                {suggestedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <p className="w-full text-sm text-muted-foreground">
                      Click to use a suggestion:
                    </p>
                    {suggestedCategories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() =>
                          form.setValue('category', cat, {
                            shouldValidate: true,
                          })
                        }
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'report' && (
              <FormField
                control={form.control}
                name="postingAs"
                render={({ field }) => (
                  <FormItem className="space-y-3 rounded-lg border p-4">
                    <FormLabel>Post as...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="verified" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Yourself (Verified Identity)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="anonymous" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Anonymous
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="whistleblower" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Whistleblower (Anonymous, signals a serious claim)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => handleFileSelect(e, 'image')}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={(e) => handleFileSelect(e, 'video')}
                  accept="video/*"
                  className="hidden"
                />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <ImageIcon className="h-5 w-5 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Image</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <VideoIcon className="h-5 w-5 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Video</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Post
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Tabs>
  );
}
