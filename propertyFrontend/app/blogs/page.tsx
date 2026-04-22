"use client";

import * as React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { Calendar, User, ArrowRight, Tag, Search, TrendingUp } from "lucide-react";

import { getBlogs, getBlogCategories, Blog, BlogCategory } from "@/api/blogApi";

export default function BlogsPage() {
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [categories, setCategories] = React.useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<number | "All">("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [expandedBlogIds, setExpandedBlogIds] = React.useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const toggleExpand = (id: number) => {
    setExpandedBlogIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [blogsData, catsData] = await Promise.all([
          getBlogs(selectedCategory === "All" ? undefined : selectedCategory),
          getBlogCategories()
        ]);
        setBlogs(blogsData);
        setCategories(catsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  const filteredPosts = blogs.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (post.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const currentItems = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search or category changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans">
      <Navbar />

      {/* 1. Hero / Header Banner */}
      <section className="relative pt-[120px] pb-16 md:pt-[140px] md:pb-20 bg-[#214347] overflow-hidden">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:linear-gradient(to_bottom,white_10%,transparent_80%)]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Our Blogs
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto font-light">
            Stay updated with the latest trends and news in the Somali real estate market.
          </p>

          {/* Search Input In Hero */}
          <div className="mt-8 max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#214347] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white text-gray-900 shadow-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400/20 transition-all text-[15px]"
            />
          </div>
        </div>
      </section>

      {/* 2. Filter Bar (Categories) */}
      <section className="relative z-30 py-10 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === "All" 
                  ? "bg-[#214347] text-white shadow-lg" 
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  selectedCategory === cat.id 
                    ? "bg-[#214347] text-white shadow-lg" 
                    : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Blog Grid */}
      <section className="py-20 md:py-28 px-6">
        <div className="container mx-auto max-w-7xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[32px] border border-gray-100 h-[500px] animate-pulse">
                  <div className="h-64 bg-gray-100 rounded-t-[32px]"></div>
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-100 rounded w-full"></div>
                    <div className="h-20 bg-gray-100 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentItems.map((post) => (
                <article 
                  key={post.id} 
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 flex flex-col h-full"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={post.image?.startsWith('http') ? post.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${post.image}`} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[#214347] text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/50">
                        {post.category.name}
                      </span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-gray-400 text-xs mb-5">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-[#214347]" />
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <User className="w-3.5 h-3.5 text-[#214347]" />
                        {post.author}
                      </span>
                    </div>

                    <h3 
                      className="text-xl font-bold text-gray-900 mb-4 leading-snug cursor-pointer hover:text-[#214347] transition-colors"
                      onClick={() => toggleExpand(post.id)}
                    >
                      {post.title}
                    </h3>

                    {expandedBlogIds.has(post.id) ? (
                      <div className="text-gray-500 text-[15px] leading-relaxed mb-8 flex-1 font-light whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 duration-300">
                        {post.content}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-[15px] leading-relaxed mb-8 flex-1 font-light line-clamp-3">
                        {post.content.replace(/<[^>]*>/g, '').substring(0, 160)}...
                      </p>
                    )}

                    <button 
                      onClick={() => toggleExpand(post.id)}
                      className={`inline-flex items-center justify-between w-full p-1 pl-4 rounded-xl border border-gray-100 transition-all duration-300 group/btn ${
                        expandedBlogIds.has(post.id) 
                          ? "bg-[#214347] text-white" 
                          : "bg-gray-50/50 hover:bg-[#214347] hover:text-white"
                      }`}
                    >
                      <span className="text-sm font-bold tracking-tight">
                        {expandedBlogIds.has(post.id) ? "Read Less" : "Read Full Story"}
                      </span>
                      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shadow-sm transition-all ${
                        expandedBlogIds.has(post.id)
                          ? "bg-teal-400 text-white"
                          : "bg-white text-[#214347] group-hover/btn:bg-teal-400 group-hover/btn:text-white"
                      }`}>
                        <ArrowRight className={`w-4 h-4 transition-transform ${expandedBlogIds.has(post.id) ? "rotate-90" : "group-hover/btn:translate-x-1"}`} />
                      </div>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
               <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <Search className="w-8 h-8 text-gray-300" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mb-3">No articles found</h3>
               <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any blog posts matching your search criteria. Try a different keyword.</p>
               <button 
                 onClick={() => {setSelectedCategory("All"); setSearchQuery("");}}
                 className="mt-8 px-8 py-3 bg-[#214347] text-white rounded-xl font-bold hover:bg-[#0d2326] transition-all shadow-lg shadow-[#214347]/20"
               >
                 Show All Articles
               </button>
            </div>
          )}

       
        </div>
      </section>

      <Footer />
    </main>
  );
}
