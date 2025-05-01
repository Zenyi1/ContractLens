import { MainLayout } from '@/components/layout/MainLayout'
import { BlogLayout } from '@/components/layout/BlogLayout'
import Image from 'next/image'

const featuredPost = {
  title: 'Introducing AI-Powered Contract Management',
  excerpt:
    'Learn about our latest update that brings even more powerful AI capabilities to your analytics dashboard.',
  author: {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    avatar: 'https://picsum.photos/32/32?random=1',
  },
  date: 'Mar 16, 2024',
  readTime: '5 min read',
  image: 'https://picsum.photos/800/400?random=1',
}

const posts = [
  {
    title: 'Best Practices for Data Visualization',
    excerpt:
      'Learn how to create effective and engaging data visualizations that tell compelling stories.',
    category: 'Tutorials',
    date: 'Mar 15, 2024',
    readTime: '4 min read',
    image: 'https://picsum.photos/400/200?random=2',
  },
  {
    title: 'The Future of Business Intelligence',
    excerpt:
      'Explore emerging trends in BI and how they will shape the future of data analytics.',
    category: 'Industry Insights',
    date: 'Mar 14, 2024',
    readTime: '6 min read',
    image: 'https://picsum.photos/400/200?random=3',
  },
  {
    title: 'Customer Success Story: TechCorp',
    excerpt:
      'See how TechCorp improved their decision-making process with our analytics platform.',
    category: 'Case Studies',
    date: 'Mar 13, 2024',
    readTime: '3 min read',
    image: 'https://picsum.photos/400/200?random=4',
  },
]

export default function BlogPage() {
  return (
    <MainLayout>
      <BlogLayout>
        {/* Featured post */}
        <article className="relative isolate mb-16">
          <div className="aspect-[2/1] overflow-hidden rounded-2xl">
            <Image
              src={featuredPost.image}
              alt={featuredPost.title}
              width={800}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-8">
            <div className="flex items-center gap-x-4 text-sm">
              <time dateTime="2024-03-16" className="text-gray-500">
                {featuredPost.date}
              </time>
              <span className="text-gray-500">{featuredPost.readTime}</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
              {featuredPost.title}
            </h1>
            <p className="mt-4 text-lg text-gray-600">{featuredPost.excerpt}</p>
            <div className="mt-8 flex items-center gap-x-4">
              <Image
                src={featuredPost.author.avatar}
                alt={featuredPost.author.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <div className="font-semibold">{featuredPost.author.name}</div>
                <div className="text-sm text-gray-600">{featuredPost.author.role}</div>
              </div>
            </div>
          </div>
        </article>

        {/* Post grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="flex flex-col">
              <div className="aspect-[2/1] overflow-hidden rounded-lg">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 pt-6">
                <div className="flex items-center gap-x-4 text-sm">
                  <span className="text-[#FF6B4A]">{post.category}</span>
                  <time dateTime="2024-03-15" className="text-gray-500">
                    {post.date}
                  </time>
                  <span className="text-gray-500">{post.readTime}</span>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </BlogLayout>
    </MainLayout>
  )
} 