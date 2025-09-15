import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // In a real application, you would fetch dynamic data (e.g., posts, profiles) 
  // from your database to generate a complete sitemap.
  // For this project, we are defining the static routes.
  const baseUrl = 'https://shame-app.com'; // Replace with your actual domain
 
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
        url: baseUrl + '/hall-of-shame',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
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
  ]
}
