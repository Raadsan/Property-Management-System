"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentCategory, setCurrentCategory] = React.useState<Category | null>(null)
  const [newName, setNewName] = React.useState("")

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const data = await getPropertyTypes()
      setCategories(data)
    } catch (error) {
      toast.error("Failed to fetch categories")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    try {
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
      fetchCategories()
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      await deletePropertyType(id)
      toast.success("Category deleted successfully")
      fetchCategories()
    } catch (error) {
      toast.error("Failed to delete category")
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
              <p className="text-muted-foreground">Manage your property types and categories.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                    <Button type="submit" className="btn-category">
                      {currentCategory ? "Update" : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead className="hidden md:table-cell">Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span>Loading categories...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">#{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditModal(category)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
