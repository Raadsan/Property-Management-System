"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon, EyeIcon } from "lucide-react"
import { 
  getBlogCategories, 
  BlogCategory, 
  // We'll need to add create/update/delete to blogApi if not there or use direct calls
} from "@/api/blogApi"
import api from "@/api/axios" // For direct calls if needed
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
import { toast } from "sonner"

export default function BlogCategoriesPage() {
  const [categories, setCategories] = React.useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentCategory, setCurrentCategory] = React.useState<BlogCategory | null>(null)
  const [viewCategory, setViewCategory] = React.useState<BlogCategory | null>(null)
  const [newName, setNewName] = React.useState("")
  const [newDescription, setNewDescription] = React.useState("")

  const fetchCategories = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const data = await getBlogCategories()
      setCategories(data)
    } catch (error) {
      toast.error("Failed to fetch categories")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    try {
      setIsSaving(true)
      if (currentCategory) {
        await api.patch(`/blog-categories/${currentCategory.id}`, { name: newName, description: newDescription })
        toast.success("Category updated successfully")
      } else {
        await api.post("/blog-categories", { name: newName, description: newDescription })
        toast.success("Category created successfully")
      }
      setIsModalOpen(false)
      setNewName("")
      setNewDescription("")
      setCurrentCategory(null)
      await fetchCategories(true)
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      setDeletingId(id)
      await api.delete(`/blog-categories/${id}`)
      toast.success("Category deleted successfully")
      await fetchCategories(true)
    } catch (error) {
      toast.error("Failed to delete category")
    } finally {
      setDeletingId(null)
    }
  }

  const openEditModal = (category: BlogCategory) => {
    setCurrentCategory(category)
    setNewName(category.name)
    setNewDescription(category.description || "")
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setCurrentCategory(null)
    setNewName("")
    setNewDescription("")
    setIsModalOpen(true)
  }

  const columns: ColumnDef<BlogCategory>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-medium text-muted-foreground">#{row.getValue("id")}</span>,
    },
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => <div className="font-semibold text-foreground">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[420px] truncate text-sm text-muted-foreground" title={row.original.description || undefined}>
          {row.getValue("description") || <span className="italic opacity-50">No description</span>}
        </div>
      ),
    },
    {
        accessorKey: "_count",
        header: "Blogs",
        cell: ({ row }) => {
            const count = (row.getValue("_count") as any)?.blogs || 0;
            return <div className="text-muted-foreground">{count} articles</div>
        }
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewCategory(row.original)}
            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            title="View category"
            aria-label={`View ${row.original.name}`}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => openEditModal(row.original)}
            disabled={isSaving || deletingId !== null}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDelete(row.original.id)}
            disabled={isSaving || deletingId === row.original.id}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deletingId === row.original.id ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      ),
    },
  ]

  return (
<div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Blog Categories</h1>
              <p className="text-muted-foreground">Manage categories for your blog articles.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!open && isSaving) return;
              setIsModalOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal} className="btn-category">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{currentCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="cat-name" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      placeholder="e.g. Interior Design"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-description">Description</Label>
                    <Textarea
                      id="cat-description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Short description of this category..."
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSaving} className="btn-category">
                      {isSaving ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          {currentCategory ? "Updating..." : "Saving..."}
                        </>
                      ) : (
                        currentCategory ? "Update" : "Save"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Dialog open={viewCategory !== null} onOpenChange={(open) => !open && setViewCategory(null)}>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Category Details</DialogTitle>
              </DialogHeader>
              {viewCategory && (
                <div className="space-y-5 py-3">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category Name</p>
                    <h2 className="mt-1 text-xl font-bold">{viewCategory.name}</h2>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                    <p className="whitespace-pre-wrap break-words leading-7 text-foreground">
                      {viewCategory.description || <span className="italic text-muted-foreground">No description provided.</span>}
                    </p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                    <span className="text-sm font-medium text-muted-foreground">Blog Articles</span>
                    <span className="font-bold">{viewCategory._count?.blogs || 0}</span>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <DataTable 
            columns={columns} 
            data={categories} 
            isLoading={isLoading} 
            filterColumn="name"
            filterPlaceholder="Search categories..."
          />
        </div>
)
}
