import { getPostBySlug } from "@/lib/blog-data"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const post = getPostBySlug(resolvedParams.slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: Props) {
  const resolvedParams = await params
  const post = getPostBySlug(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">{post.title}</h1>
        <p className="text-lg text-gray-400">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div
        className="prose prose-invert prose-lg max-w-none mx-auto text-gray-300"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <hr className="my-12 border-gray-800" />

      {post.author && (
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-white">{post.author.name}</p>
            <p className="text-sm text-gray-400">Author</p>
          </div>
        </div>
      )}
    </article>
  )
}
