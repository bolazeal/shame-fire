'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { suggestCategories } from '@/ai/flows/suggest-categories';
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

const formSchema = z
  .object({
    type: z.enum(['report', 'endorsement', 'post']),
    postingAs: z.enum(['verified', 'anonymous', 'whistleblower']),
    entity: z.string().optional(),
    text: z.string().min(1, {
      message: "This field can't be empty.",
    }),
    category: z.string().optional(),
    mediaUrl: z.string().optional(),
    mediaType: z.enum(['image', 'video']).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'post') return true;
      return data.entity && data.entity.length >= 2;
    },
    {
      message: 'Entity name must be at least 2 characters.',
      path: ['entity'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'post') return true;
      return data.text && data.text.length >= 10;
    },
    {
      message:
        'Description must be at least 10 characters for reports and endorsements.',
      path: ['text'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'post') return true;
      return data.category && data.category.length >= 2;
    },
    {
      message: 'Category must be at least 2 characters.',
      path: ['category'],
    }
  );

export function CreatePostForm({
  onPostCreated,
}: {
  onPostCreated: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'report' | 'endorsement' | 'post'>(
    'post'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestingCategories, setIsSuggestingCategories] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const [mediaPreview, setMediaPreview] = useState<{
    url: string;
    type: 'image' | 'video';
  } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'post',
      postingAs: 'verified',
      entity: '',
      text: '',
      category: '',
      mediaUrl: '',
      mediaType: undefined,
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
    form.setValue('type', newType);
    form.reset({
      type: newType,
      postingAs: 'verified',
      entity: '',
      text: '',
      category: '',
    });
    form.clearErrors();
    setSuggestedCategories([]);
    clearMedia();
  };

  const handleSuggestCategories = async () => {
    const reportText = form.getValues('text');
    if (reportText.length < 20) {
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
      const result = await suggestCategories({ reportText });
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // In a real app, you would submit this data to your backend,
    // potentially after running sentiment analysis AI flows.
    console.log('Form submitted:', values);

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Post created!',
      description: `Your ${values.type} has been successfully submitted.`,
    });
    setIsSubmitting(false);
    onPostCreated();
  }

  const getPlaceholder = () => {
    if (activeTab === 'report') return 'Describe the incident...';
    if (activeTab === 'endorsement') return 'Describe the positive experience...';
    return "What's happening?";
  };

  return (
    <Tabs
      defaultValue="post"
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
              <>
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
              </>
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
              <>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Customer Service, Product Quality"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </>
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
