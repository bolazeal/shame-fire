import { MedalCard } from '@/components/medal-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';
import { getHonourRollUsers } from '@/lib/firestore';
import { medals } from '@/lib/medals';
import { Crown, Info, UserCog } from 'lucide-react';
import Link from 'next/link';

export default async function HallOfHonourPage() {
  const laureates = await getHonourRollUsers();

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
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

        <section id="recent-laureates">
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Recent Laureates
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Top 5 Users by Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {laureates.length > 0 ? (
                laureates.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-4">
                      <UserAvatar user={user} className="h-14 w-14" />
                      <div>
                        <p className="text-lg font-bold">{user.name}</p>
                        <p className="text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {user.trustScore}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Trust Score
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No laureates to display yet.
                </p>
              )}
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
                  Medal Nominations
                </h3>
                <p>
                  Any user can nominate another user or entity for a medal
                  directly from their profile page or from a qualifying post
                  (e.g., a highly-rated endorsement).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  AI-Assisted Shortlisting
                </h3>
                <p>
                  Our platform uses trust data, sentiment analysis, and the
                  number of positive interactions to create a shortlist of
                  nominees for each medal category.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Moderator Selection
                </h3>
                <p>
                  In addition to medals, community members can nominate trusted
                  users (with high Trust Scores) to be considered for
                  moderator roles. These nominations are reviewed by platform
                  administrators.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Final Voting & Review
                </h3>
                <p>
                  The final winners for medals are chosen through a
                  community-wide vote. The entire process is overseen by
                  platform administrators to maintain fairness and integrity.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
