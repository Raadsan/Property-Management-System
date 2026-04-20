"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, ImageIcon } from "lucide-react"
import { 
  getBlogs, 
  getBlogCategories,
  createBlog,
  updateBlog,
  deleteBlog,
  Blog, 
  BlogCategory 
} from "@/api/blogApi"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function BlogsRegistrationPage() {
  const [blogs, setBlogs] = React.useState<Blog[]>([])
  const [categories, setCategories] = React.useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentBlog, setCurrentBlog] = React.useState<Blog | null>(null)
  
  // Form State
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [author, setAuthor] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("")
  
  // File State
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [blogsData, catsData] = await Promise.all([
        getBlogs(),
        getBlogCategories()
      ])
      setBlogs(blogsData)
      setCategories(catsData)
    } catch (error) {
      toast.error("Failed to load blog data")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content || !author || !categoryId) {
      return toast.error("Please fill in all required fields.")
    }

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("author", author)
      formData.append("categoryId", categoryId)
      
      if (selectedFile) {
        formData.append("image", selectedFile)
      }

      if (currentBlog) {
        await updateBlog(currentBlog.id, formData)
        toast.success("Blog updated successfully")
      } else {
        await createBlog(formData)
        toast.success("Blog created successfully")
      }

      setIsModalOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "An error occurred while saving"
      toast.error(errMsg)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      await deleteBlog(id)
      toast.success("Blog deleted successfully")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete blog")
    }
  }

  const openEditModal = (blog: Blog) => {
    setCurrentBlog(blog)
    setTitle(blog.title)
    setContent(blog.content)
    setAuthor(blog.author)
    setCategoryId(blog.categoryId.toString())
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setCurrentBlog(null)
    setTitle("")
    setContent("")
    setAuthor("")
    setCategoryId("")
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}/${imagePath.replace(/\\/g, '/').replace(/^\//, '')}`;
  }

  const columns: ColumnDef<Blog>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const imagePath = row.original.image;
        if (!imagePath) return <div className="h-10 w-16 bg-muted rounded flex items-center justify-center border border-dashed"><ImageIcon className="h-4 w-4 text-muted-foreground opacity-50" /></div>;
        return (
          <img 
            src={getImageUrl(imagePath)} 
            alt={row.original.title} 
            className="h-10 w-16 object-cover rounded shadow-sm border"
          />
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-semibold text-sm line-clamp-1 max-w-[250px]">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => (
        <span className="bg-muted border px-2 py-0.5 rounded text-xs font-medium">
          {row.original.category?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => <div className="text-sm">{row.getValue("author")}</div>,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => openEditModal(row.original)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="mt-0! mr-0!">
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>
              <p className="text-muted-foreground">Manage your blog articles and publications.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsModalOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="bg-[#214347] hover:bg-[#1a3539] shrink-0">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Blog Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{currentBlog ? "Edit Blog Post" : "Add New Blog Post"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  
                  {/* Title */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog Title" required />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category <span className="text-red-500">*</span></Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={`cat-${cat.id}`} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Author */}
                  <div className="space-y-2">
                    <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                    <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author Name" required />
                  </div>

                  {/* Content */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="content">Full Content <span className="text-red-500">*</span></Label>
                    <Textarea 
                      id="content" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="Write your article here..."
                      rows={8}
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2 md:col-span-2 p-4 border rounded-md bg-muted/20">
                    <Label htmlFor="image" className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <ImageIcon className="h-4 w-4" /> Cover Image
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer file:cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {currentBlog?.image 
                        ? "Uploading a new image will replace the current cover image."
                        : "Select an image to use as the blog cover."}
                    </p>
                  </div>

                  <DialogFooter className="md:col-span-2 mt-4">
                    <Button type="submit" className="bg-[#214347] hover:bg-[#1a3539] w-full md:w-auto">
                      {currentBlog ? "Update Post" : "Publish Post"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <DataTable 
            columns={columns} 
            data={blogs} 
            isLoading={isLoading} 
            filterColumn="title"
            filterPlaceholder="Search blogs by title..."
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
