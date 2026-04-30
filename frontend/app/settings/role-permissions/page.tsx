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
import { Loader2Icon, SaveIcon, ShieldAlertIcon, CheckSquareIcon, SquareIcon } from "lucide-react"

import { getRoles, Role } from "@/api/rolesApi"
import { getMenus, Menu as AppMenu } from "@/api/menuApi"
import { getRolePermissionsById, syncRolePermissions, RoleMenuAccess } from "@/api/rolePermissionsApi"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

const PERMISSION_COLUMNS = [
  { key: 'canView', label: 'View' },
  { key: 'canAdd', label: 'Add' },
  { key: 'canEdit', label: 'Edit' },
  { key: 'canDelete', label: 'Delete' },
] as const;

export default function RolePermissionsPage() {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [allMenus, setAllMenus] = React.useState<AppMenu[]>([])
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  
  const [matrix, setMatrix] = React.useState<RoleMenuAccess[]>([])
  
  const [isLoadingDB, setIsLoadingDB] = React.useState(true)
  const [isSyncing, setIsSyncing] = React.useState(false)

  // Initialization
  React.useEffect(() => {
    const init = async () => {
      try {
        const [rolesData, menusData] = await Promise.all([
          getRoles(),
          getMenus()
        ])
        setRoles(rolesData)
        setAllMenus(menusData)
      } catch (error) {
        toast.error("Failed to load core components (Roles/Menus)")
      } finally {
        setIsLoadingDB(false)
      }
    }
    init()
  }, [])

  // When a Role is selected, build the Matrix!
  React.useEffect(() => {
    if (!selectedRoleId) {
      setMatrix([])
      return
    }

    const loadMatrix = async () => {
      setIsLoadingDB(true)
      try {
        // Fetch existing permissions for this role
        let mappedPerms: RoleMenuAccess[] = []
        try {
          const roleData = await getRolePermissionsById(parseInt(selectedRoleId))
          if (roleData && roleData.menus) {
            mappedPerms = roleData.menus
          }
        } catch (e: any) {
          // 404 just means no permissions setup yet
        }

        // Build the state model based on ALL MENUS matching against the fetched database mappedPerms
        const builtMatrix = allMenus.map(m => {
          const existingMenuPerm = mappedPerms.find(pm => pm.menuId === m.id)
          
          return {
            menuId: m.id,
            canView: existingMenuPerm?.canView || false,
            canAdd: existingMenuPerm?.canAdd || false,
            canEdit: existingMenuPerm?.canEdit || false,
            canDelete: existingMenuPerm?.canDelete || false,
            subMenus: m.subMenus?.map(sm => {
              const existingSubPerm = existingMenuPerm?.subMenus?.find(psm => psm.subMenuId === sm.id)
              return {
                subMenuId: sm.id!,
                canView: existingSubPerm?.canView || false,
                canAdd: existingSubPerm?.canAdd || false,
                canEdit: existingSubPerm?.canEdit || false,
                canDelete: existingSubPerm?.canDelete || false,
              }
            }) || []
          }
        })

        setMatrix(builtMatrix)
      } catch (error) {
        toast.error("Failed to map role permissions")
      } finally {
        setIsLoadingDB(false)
      }
    }

    loadMatrix()

  }, [selectedRoleId, allMenus])

  // Handlers for Matrix Checkbox
  const handleMenuChange = (menuId: number, colKey: string, checked: boolean) => {
    setMatrix(prev => prev.map(m => {
      if (m.menuId === menuId) {
        return { ...m, [colKey]: checked }
      }
      return m
    }))
  }

  const handleSubMenuChange = (menuId: number, subMenuId: number, colKey: string, checked: boolean) => {
    setMatrix(prev => prev.map(m => {
      if (m.menuId === menuId && m.subMenus) {
        return {
          ...m,
          subMenus: m.subMenus.map(sm => {
            if (sm.subMenuId === subMenuId) {
              return { ...sm, [colKey]: checked }
            }
            return sm
          })
        }
      }
      return m
    }))
  }

  const handleCheckAll = () => {
    setMatrix(prev => prev.map(m => ({
      ...m,
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
      subMenus: m.subMenus?.map(sm => ({
        ...sm,
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
      }))
    })))
  }

  const handleClearAll = () => {
    setMatrix(prev => prev.map(m => ({
      ...m,
      canView: false,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      subMenus: m.subMenus?.map(sm => ({
        ...sm,
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
      }))
    })))
  }

  const handleSave = async () => {
    if (!selectedRoleId) return toast.error("Select a role first")
    
    setIsSyncing(true)
    try {
      await syncRolePermissions({
        roleId: parseInt(selectedRoleId),
        menus: matrix
      })
      toast.success("Permissions updated successfully!")
    } catch (error) {
      toast.error("Failed to sync permissions")
    } finally {
      setIsSyncing(false)
    }
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Role Permissions Matrix</h1>
              <p className="text-muted-foreground">Map high-level ACL restrictions for explicit UI actions across the site.</p>
            </div>
            
            <div className="flex gap-2 items-center w-full md:w-auto flex-wrap">
              <Button disabled={!selectedRoleId || isLoadingDB} onClick={handleCheckAll} variant="outline" size="sm">
                <CheckSquareIcon className="h-4 w-4 mr-2" /> Select All
              </Button>
              <Button disabled={!selectedRoleId || isLoadingDB} onClick={handleClearAll} variant="outline" size="sm">
                <SquareIcon className="h-4 w-4 mr-2" /> Clear All
              </Button>

              <div className="w-[200px] ml-2">
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Target Role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>{r.name} Role</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button disabled={!selectedRoleId || isLoadingDB || isSyncing} onClick={handleSave} className="btn-category min-w-[140px]">
                {isSyncing ? <Loader2Icon className="h-4 w-4 mr-2 animate-spin" /> : <SaveIcon className="h-4 w-4 mr-2" />}
                Sync Security
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <Table className="min-w-[1000px]">
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[250px] sticky left-0 bg-muted/95 backdrop-blur shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">Navigation Node</TableHead>
                    {PERMISSION_COLUMNS.map(col => (
                      <TableHead key={col.key} className="text-center font-bold text-xs uppercase tracking-widest">{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingDB && !selectedRoleId ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Select a Role to view and modify permission architectures.</TableCell>
                    </TableRow>
                  ) : isLoadingDB ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                          <Loader2Icon className="h-5 w-5 animate-spin" /> Loading role architecture mapping...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : matrix.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <ShieldAlertIcon className="h-10 w-10 mb-2 opacity-20" />
                          <p>No navigation menus are established yet to map permissions against.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allMenus.map((globalMenu) => {
                      const mState = matrix.find(x => x.menuId === globalMenu.id);
                      if (!mState) return null;

                      return (
                        <React.Fragment key={`menu-${globalMenu.id}`}>
                          {/* Main Menu Row */}
                          <TableRow className="bg-muted/10">
                            <TableCell className="font-bold border-r bg-card sticky left-0 z-0">
                              {globalMenu.title}
                            </TableCell>
                            {PERMISSION_COLUMNS.map(col => (
                              <TableCell key={col.key} className="text-center border-r last:border-0 border-dashed">
                                <Checkbox 
                                  checked={mState[col.key as keyof RoleMenuAccess] as boolean}
                                  onCheckedChange={(c) => handleMenuChange(globalMenu.id, col.key, !!c)}
                                />
                              </TableCell>
                            ))}
                          </TableRow>

                          {/* Sub Menu Rows - Only displayed if parent "View" is enabled */}
                          {mState.canView && globalMenu.subMenus?.map((subGlobal) => {
                            const subState = mState.subMenus?.find(x => x.subMenuId === subGlobal.id)
                            if (!subState) return null;

                            return (
                              <TableRow key={`sub-${subGlobal.id}`}>
                                <TableCell className="pl-10 text-sm font-medium text-muted-foreground border-r bg-card sticky left-0 z-0">
                                  — {subGlobal.title}
                                </TableCell>
                                {PERMISSION_COLUMNS.map(col => (
                                  <TableCell key={col.key} className="text-center border-r last:border-0 border-dashed opacity-80 bg-muted/5">
                                    <Checkbox 
                                      checked={subState[col.key as keyof typeof subState] as boolean}
                                      onCheckedChange={(c) => handleSubMenuChange(globalMenu.id, subGlobal.id!, col.key, !!c)}
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            )
                          })}
                        </React.Fragment>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">Changes are synced incrementally per-role via the backend database maps.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
