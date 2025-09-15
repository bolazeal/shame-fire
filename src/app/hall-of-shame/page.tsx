import { MedalCard } from '@/components/medal-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';
import { getShameRollUsers } from '@/lib/firestore';
import { shameMedals } from '@/lib/shame-medals';
import { Info, ThumbsDown } from 'lucide-react';
import Link from 'next/link';

export default async function HallOfShamePage() {
  const culprits = await getShameRollUsers();

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <ThumbsDown className="h-6 w-6 text-destructive" />
          <h1 className="text-xl font-bold font-headline">Hall of Shame</h1>
        </div>
      </header>

      <div className="space-y-8 p-4">
        <section id="medal-categories">
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Medals of Shame
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shameMedals.map((medal) => (
              <MedalCard key={medal.title} medal={medal} />
            ))}
          </div>
        </section>

        <section id="recent-culprits">
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Lowest Rated Users
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-destructive" />
                Bottom 5 Users by Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {culprits.length > 0 ? (
                culprits.map((user) => (
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
                      <p className="text-lg font-bold text-destructive">
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
                  No users with low scores to display right now.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section id="criteria">
          <h2 className="mb-4 text-2xl font-bold font-headline">
            How It Works
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Criteria for the Hall of Shame
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground">
                  Low Trust Score
                </h3>
                <p>
                  Users who consistently receive negative reports and downvotes
                  will see their Trust Score decrease. The lowest-scoring
                  users are featured here.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  AI-Assisted Analysis
                </h3>
                <p>
                  Our AI analyzes the sentiment of reports and community
                  feedback to adjust Trust Scores. Consistently negative
                  sentiment contributes to a lower score.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Community Reports
                </h3>
                <p>
                  A high volume of credible, upheld reports against a user or
                  entity is a primary factor for inclusion in the Hall of
                  Shame.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
