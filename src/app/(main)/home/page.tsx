'use client';

import { PostCard } from '@/components/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPosts } from '@/lib/mock-data';
import type { Post } from '@/lib/types';
import { useState } from 'react';

export default function HomePage() {
  const [filter, setFilter] = useState('foryou');

  const filteredPosts = mockPosts.filter((post) => {
    if (filter === 'posts') {
      return post.type === 'post';
    }
    if (filter === 'reports') {
      return post.type === 'report';
    }
    if (filter === 'endorsements') {
      return post.type === 'endorsement';
    }
    return true; // 'foryou' shows all posts
  });

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold font-headline">Home</h1>
      </header>

      <Tabs defaultValue="foryou" onValueChange={setFilter} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-4 rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="foryou"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-accent/50 data-[state=active]:shadow-none"
          >
            For You
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-accent/50 data-[state=active]:shadow-none"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-accent/50 data-[state=active]:shadow-none"
          >
            Reports
          </TabsTrigger>
          <TabsTrigger
            value="endorsements"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-accent/50 data-[state=active]:shadow-none"
          >
            Endorsements
          </TabsTrigger>
        </TabsList>
        <TabsContent value="foryou">
          <section className="flex flex-col">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        </TabsContent>
        <TabsContent value="posts">
          <section className="flex flex-col">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {filteredPosts.length === 0 && (
              <p className="p-4 text-center text-muted-foreground">
                No posts yet.
              </p>
            )}
          </section>
        </TabsContent>
        <TabsContent value="reports">
          <section className="flex flex-col">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {filteredPosts.length === 0 && (
              <p className="p-4 text-center text-muted-foreground">
                No reports yet.
              </p>
            )}
          </section>
        </TabsContent>
        <TabsContent value="endorsements">
          <section className="flex flex-col">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {filteredPosts.length === 0 && (
              <p className="p-4 text-center text-muted-foreground">
                No endorsements yet.
              </p>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
