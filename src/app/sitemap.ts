import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // NOTE: In a real application, you would fetch this data from your database
  // to generate URLs for all posts, profiles, and disputes dynamically.
  // For this demo, we are using static mock data.

  const mockPostIds = ['post1', 'post2', 'post3', 'post4', 'post5', 'post6', 'post7', 'post8'];
  const mockUserIds = ['user1', 'user2', 'user3', 'user5', 'clarityOfficial'];
  const mockDisputeIds = ['dispute1', 'dispute2'];

  const baseUrl = 'https://www.clarity-app.com';

  const posts = mockPostIds.map((id) => ({
    url: `${baseUrl}/post/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const profiles = mockUserIds.map((id) => ({
    url: `${baseUrl}/profile/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const disputes = mockDisputeIds.map((id) => ({
    url: `${baseUrl}/dispute/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
 
  return [
    {
      url: baseUrl + '/home',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: baseUrl + '/village-square',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: baseUrl + '/hall-of-honour',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
        url: baseUrl + '/search',
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 0.8,
    },
    {
      url: baseUrl + '/login',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: baseUrl + '/signup',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...posts,
    ...profiles,
    ...disputes,
  ]
}
