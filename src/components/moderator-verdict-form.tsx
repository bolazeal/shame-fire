
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Gavel, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { addVerdictToDisputeAction } from '@/lib/actions/dispute';

const verdictSchema = z.object({
  decision: z.string().min(10, {
    message: 'Decision must be at least 10 characters.',
  }),
  reason: z.string().min(20, {
    message: 'Reasoning must be at least 20 characters.',
  }),
});

interface ModeratorVerdictFormProps {
  disputeId: string;
  onSuccess: () => void;
}

export function ModeratorVerdictForm({ disputeId, onSuccess }: ModeratorVerdictFormProps) {
  const { toast } = useToast();
  const { fullProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof verdictSchema>>({
    resolver: zodResolver(verdictSchema),
    defaultValues: {
      decision: '',
      reason: '',
    },
  });

  async function onSubmit(values: z.infer<typeof verdictSchema>) {
    if (!fullProfile) {
        toast({ title: 'Authentication Error', description: 'Could not verify moderator identity.', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    try {
      await addVerdictToDisputeAction(disputeId, values.decision, values.reason, fullProfile);
      toast({
        title: 'Verdict Submitted',
        description: 'The dispute has been closed.',
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to submit verdict:', error);
      toast({
        title: 'Submission Failed',
        description: 'Could not save the verdict.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="decision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Decision</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., The report is upheld." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reasoning</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed explanation for the decision..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Gavel className="mr-2 h-4 w-4" />
          )}
          Submit Verdict & Close Case
        </Button>
      </form>
    </Form>
  );
}
