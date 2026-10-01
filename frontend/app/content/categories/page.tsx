"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon } from "lucide-react"
import { 
  getPropertyTypes, 
  createPropertyType, 
  updatePropertyType, 
  deletePropertyType,
  Category 
} from "@/api/propertyTypeApi"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { usePagePermissions } from "@/hooks/usePagePermissions"

export default function CategoriesPage() {
  const permissions = usePagePermissions("/content/categories")
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentCategory, setCurrentCategory] = React.useState<Category | null>(null)
  const [newName, setNewName] = React.useState("")

  const fetchCategories = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const data = await getPropertyTypes()
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
        await updatePropertyType(currentCategory.id, newName)
        toast.success("Category updated successfully")
      } else {
        await createPropertyType(newName)
        toast.success("Category created successfully")
      }
      setIsModalOpen(false)
      setNewName("")
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
      await deletePropertyType(id)
      toast.success("Category deleted successfully")
      await fetchCategories(true)
    } catch (error) {
      toast.error("Failed to delete category")
    } finally {
      setDeletingId(null)
    }
  }

  const openEditModal = (category: Category) => {
    setCurrentCategory(category)
    setNewName(category.name)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setCurrentCategory(null)
    setNewName("")
    setIsModalOpen(true)
  }

  // Define columns for DataTable
  const columns: ColumnDef<Category>[] = [
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
      accessorKey: "createdAt",
      header: "Created At",
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
          {permissions.canEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => openEditModal(row.original)}
              disabled={isSaving || deletingId !== null}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          {permissions.canDelete && (
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
          )}
        </div>
      ),
    },
  ]

  return (
<div className="flex flex-1 flex-col p-3 sm:p-4 md:p-6 min-w-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Categories</h1>
              <p className="text-sm text-muted-foreground">Manage property categories and classifications.</p>
            </div>
            {permissions.canAdd && (
              <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!open && isSaving) return;
                setIsModalOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateModal} className="btn-category w-full sm:w-auto shrink-0">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{currentCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input 
                        id="name" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        className="col-span-3" 
                        placeholder="e.g. Apartments"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSaving} className="btn-category mt-4">
                        {isSaving ? (
                          <>
                            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                            {currentCategory ? "Updating..." : "Saving..."}
                          </>
                        ) : (
                          currentCategory ? "Update Category" : "Save Category"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <DataTable 
            columns={columns} 
            data={categories} 
            isLoading={isLoading} 
            filterColumn="name"
            filterPlaceholder="Search categories by name..."
          />
        </div>
)
}
