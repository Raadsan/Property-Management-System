"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getBlogBySlug, Blog } from "@/api/blogApi";
import { getMediaUrl } from "@/lib/mediaUrl";
import { BlogContent } from "@/lib/renderBlogContent";
import { Calendar, ArrowLeft, Loader2, MessageCircle, Send, Play, AtSign, UserRound, Music2, BriefcaseBusiness, Code2, Camera, Link as LinkIcon, Share2, Mail, Copy, Check } from "lucide-react";

const socialIcons = {
  whatsapp: MessageCircle,
  telegram: Send,
  youtube: Play,
  twitter: AtSign,
  x: AtSign,
  facebook: UserRound,
  tiktok: Music2,
  linkedin: BriefcaseBusiness,
  github: Code2,
  instagram: Camera,
};

export default function SingleBlogPage() {
  const { id: slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

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

  const shareBlog = async () => {
    const shareData = { title: blog.title, url: pageUrl || window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(pageUrl || window.location.href);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(blog.title);
  const shareOptions = [
    { label: "Facebook", shortLabel: "f", color: "bg-[#1877F2]", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "X / Twitter", shortLabel: "𝕏", color: "bg-[#1DA1F2]", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "LinkedIn", shortLabel: "in", color: "bg-[#0A66C2]", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "WhatsApp", icon: MessageCircle, color: "bg-[#25D366]", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { label: "Email", icon: Mail, color: "bg-gray-600", href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
  ];

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

        <div className="flex flex-wrap items-center gap-2 mt-10 pt-7 border-t border-gray-200" aria-label="Blog social media links">
            {blog.socials?.map((social) => {
              const platformKey = social.platform.toLowerCase().trim() as keyof typeof socialIcons;
              const Icon = socialIcons[platformKey] || LinkIcon;
              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  title={social.platform}
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center hover:bg-[#214347] hover:text-white transition-colors"
                >
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              );
            })}
            {blog.socials?.length > 0 && <span className="w-px h-8 bg-gray-200 mx-1" />}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsShareOpen((open) => !open)}
                aria-label="Share blog"
                aria-expanded={isShareOpen}
                title="Share blog"
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center hover:bg-[#214347] hover:text-white transition-colors"
              >
                <Share2 className="w-[18px] h-[18px]" />
              </button>

              {isShareOpen && (
                <div className="absolute bottom-12 left-0 sm:left-auto sm:right-0 z-30 w-[270px] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                  <p className="mb-3 text-sm font-bold text-gray-900">Share this article</p>
                  <button
                    type="button"
                    onClick={shareBlog}
                    className="mb-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#214347] text-sm font-bold text-white hover:bg-[#173236]"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {shareOptions.map(({ label, shortLabel, icon: Icon, color, href }) => (
                      <a
                        key={label}
                        href={href}
                        target={label === "Email" ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        aria-label={`Share on ${label}`}
                        title={label}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white transition-transform hover:scale-105 ${color}`}
                      >
                        {Icon ? <Icon className="h-[18px] w-[18px]" /> : shortLabel}
                      </a>
                    ))}
                    <button
                      type="button"
                      onClick={copyLink}
                      aria-label="Copy article link"
                      title={isCopied ? "Copied" : "Copy link"}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition-transform hover:scale-105"
                    >
                      {isCopied ? <Check className="h-[18px] w-[18px] text-green-600" /> : <Copy className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
      </section>

      <Footer />
    </main>
  );
}
