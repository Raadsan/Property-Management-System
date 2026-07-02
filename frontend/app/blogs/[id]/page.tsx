"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getBlogBySlug, Blog } from "@/api/blogApi";
import { getMediaUrl } from "@/lib/mediaUrl";
import { BlogContent } from "@/lib/renderBlogContent";
import { Calendar, ArrowLeft, Loader2 } from "lucide-react";

export default function SingleBlogPage() {
  const { id: slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;
      try {
        const data = await getBlogBySlug(String(slug));
        setBlog(data);
      } catch (error) {
        console.error("Failed to fetch blog", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#214347]" />
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog not found</h1>
        <button onClick={() => router.back()} className="text-[#214347] font-medium hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </button>
      </main>
    );
  }

  const authorInitial = blog.author?.charAt(0)?.toUpperCase() || "D";

  return (
    <main className="min-h-screen bg-white font-sans">
      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#214347] transition-colors mb-10 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {blog.image && (
          <div className="w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden mb-10 shadow-sm">
            <img
              src={getMediaUrl(blog.image)}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-[28px] md:text-[36px] lg:text-[40px] font-black text-[#214347] leading-[1.2] tracking-tight mb-6">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-gray-200">
          <div className="w-10 h-10 rounded-full bg-[#214347] text-white flex items-center justify-center text-sm font-bold shrink-0">
            {authorInitial}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{blog.author}</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {blog.category?.name && (
              <>
                <span className="hidden sm:inline text-gray-300">|</span>
                <span className="text-[#214347] font-semibold uppercase text-xs tracking-wider">
                  {blog.category.name}
                </span>
              </>
            )}
          </div>
        </div>

        <BlogContent content={blog.content} />
      </section>

      <Footer />
    </main>
  );
}
