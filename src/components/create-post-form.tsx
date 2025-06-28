'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
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

const formSchema = z
  .object({
    type: z.enum(['report', 'endorsement', 'post']),
    entity: z.string().optional(),
    text: z.string().min(1, {
      message: "This field can't be empty.",
    }),
    category: z.string().optional(),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'post',
      entity: '',
      text: '',
      category: '',
    },
  });

  const handleTabChange = (value: string) => {
    const newType = value as 'report' | 'endorsement' | 'post';
    setActiveTab(newType);
    form.setValue('type', newType);
    form.reset({
      type: newType,
      entity: '',
      text: '',
      category: '',
    });
    form.clearErrors();
    setSuggestedCategories([]);
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

            <div className="flex justify-end pt-2">
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
