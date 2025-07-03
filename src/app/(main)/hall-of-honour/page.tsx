import { MedalCard } from '@/components/medal-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';
import { medals } from '@/lib/medals';
import { mockUsers } from '@/lib/mock-data';
import { Crown, Info, Medal, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function HallOfHonourPage() {
  const pastWinners = [mockUsers.user2, mockUsers.user1, mockUsers.user5];

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="text-xl font-bold font-headline">Hall of Honour</h1>
        </div>
      </header>

      <div className="space-y-8 p-4">
        <section id="medal-categories">
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Medal Categories
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {medals.map((medal) => (
              <MedalCard key={medal.title} medal={medal} />
            ))}
          </div>
        </section>

        <section id="past-winners">
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Recent Winners
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Laureates of 2023
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pastWinners.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-4">
                    <UserAvatar user={user} className="h-14 w-14" />
                    <div>
                      <p className="text-lg font-bold">{user.name}</p>
                      <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="nomination-criteria">
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Nomination & Voting Process
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground">
                  Public Nominations
                </h3>
                <p>
                  Any user can nominate another user or entity directly from
                  their profile page or from a qualifying post (e.g., a highly-rated
                  endorsement).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  AI-Assisted Shortlisting
                </h3>
                <p>
                  Our platform uses trust data, sentiment analysis, and the
                  number of positive interactions to create a shortlist of
                  nominees for each category.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Final Voting
                </h3>
                <p>
                  The final winners are chosen through a community-wide vote.
                  Only verified users are eligible to cast a vote to ensure
                  fairness.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Moderation
                </h3>
                <p>
                  The entire process is overseen by platform administrators to
                  maintain the integrity of the awards.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
