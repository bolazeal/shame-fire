
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { medals } from '@/lib/medals';
import { ScrollArea } from './ui/scroll-area';
import { MedalCard } from './medal-card';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NominationDialogProps {
  children: React.ReactNode;
  nominatedUserName: string;
  onNominate: (medalTitle: string) => Promise<void>;
}

export function NominationDialog({
  children,
  nominatedUserName,
  onNominate,
}: NominationDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedMedal, setSelectedMedal] = useState<string | null>(null);
  const [isNominating, setIsNominating] = useState(false);

  const handleNominateClick = async () => {
    if (!selectedMedal) {
      toast({
        title: 'No Medal Selected',
        description: 'Please select a medal to nominate the user for.',
        variant: 'destructive',
      });
      return;
    }
    setIsNominating(true);
    try {
      await onNominate(selectedMedal);
      setOpen(false); // Close dialog on success
      setSelectedMedal(null);
    } catch (error) {
        // Error toast is handled by the parent component
    } finally {
      setIsNominating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nominate {nominatedUserName}</DialogTitle>
          <DialogDescription>
            Select a Medal of Honour to nominate this user for. Your nomination
            is public and helps recognize positive community members.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72">
          <div className="grid grid-cols-1 gap-4 p-1">
            {medals.map((medal) => (
              <button
                key={medal.title}
                className={cn(
                  'rounded-lg border text-left transition-all',
                  selectedMedal === medal.title
                    ? 'border-primary ring-2 ring-primary'
                    : 'hover:bg-accent/50'
                )}
                onClick={() => setSelectedMedal(medal.title)}
              >
                <MedalCard medal={medal} />
              </button>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleNominateClick}
            disabled={!selectedMedal || isNominating}
          >
            {isNominating && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirm Nomination
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
