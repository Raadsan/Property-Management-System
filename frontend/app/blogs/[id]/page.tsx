"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getBlogById, Blog } from "@/api/blogApi";
import { Calendar, User, ArrowLeft, Loader2, Tag } from "lucide-react";
import Link from "next/link";

export default function SingleBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      try {
        const data = await getBlogById(Number(id));
        setBlog(data);
      } catch (error) {
        console.error("Failed to fetch blog", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#214347]" />
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog not found</h1>
        <button onClick={() => router.back()} className="text-[#214347] font-medium hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans">
      <Navbar />

      <section className="pt-32 pb-16 px-6 max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-500 hover:text-[#214347] transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
          {blog.image && (
            <div className="w-full h-[400px] md:h-[500px]">
              <img 
                src={blog.image.startsWith('http') ? blog.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${blog.image}`} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#214347] bg-[#214347]/10 px-3 py-1 rounded-full">
                <Tag className="w-3.5 h-3.5" />
                {blog.category?.name}
              </span>
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-[#214347]" />
                {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 hidden md:block"></span>
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-[#214347]" />
                {blog.author}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-8 leading-tight">
              {blog.title}
            </h1>

            <div className="prose prose-lg max-w-none text-gray-600 font-light leading-relaxed whitespace-pre-wrap">
              {blog.content}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
