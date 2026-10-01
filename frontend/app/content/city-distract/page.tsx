"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, TrashIcon, Loader2Icon, MapPinIcon, NetworkIcon } from "lucide-react";
import {
  getCities,
  createCity,
  updateCity,
  deleteCity,
  City,
  District,
} from "@/api/cityApi";
import { invalidateLocationsCache } from "@/hooks/useLocations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type DistrictForm = { id?: number; name: string; order: number };

export default function CityDistrictPage() {
  const [cities, setCities] = React.useState<City[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentCity, setCurrentCity] = React.useState<City | null>(null);

  const [name, setName] = React.useState("");
  const [order, setOrder] = React.useState(0);
  const [isDefault, setIsDefault] = React.useState(false);
  const [districts, setDistricts] = React.useState<DistrictForm[]>([]);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await getCities();
      setCities(data);
    } catch {
      toast.error("Failed to load cities");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleAddDistrict = () => {
    setDistricts([...districts, { name: "", order: districts.length }]);
  };

  const handleDistrictChange = (index: number, field: "name" | "order", value: string) => {
    const updated = [...districts];
    if (field === "order") {
      updated[index].order = parseInt(value) || 0;
    } else {
      updated[index].name = value;
    }
    setDistricts(updated);
  };

  const handleRemoveDistrict = (index: number) => {
    setDistricts(districts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("City name is required.");

    const cleanDistricts = districts
      .filter((d) => d.name.trim())
      .map((d) => ({ id: d.id, name: d.name.trim(), order: d.order }));

    try {
      setIsSaving(true);
      const payload = {
        name: name.trim(),
        order,
        isDefault,
        districts: cleanDistricts,
      };

      if (currentCity) {
        await updateCity(currentCity.id, payload);
        toast.success("City updated successfully");
      } else {
        await createCity(payload);
        toast.success("City created successfully");
      }

      invalidateLocationsCache();
      setIsModalOpen(false);
      resetForm();
      await loadData(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save city");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this city and all its districts?")) return;

    try {
      setDeletingId(id);
      await deleteCity(id);
      invalidateLocationsCache();
      toast.success("City deleted successfully");
      await loadData(true);
    } catch {
      toast.error("Failed to delete city");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (city: City) => {
    setCurrentCity(city);
    setName(city.name);
    setOrder(city.order || 0);
    setIsDefault(Boolean(city.isDefault));
    setDistricts(
      (city.districts || []).map((d) => ({
        id: d.id,
        name: d.name,
        order: d.order || 0,
      }))
    );
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentCity(null);
    setName("");
    setOrder(cities.length);
    setIsDefault(false);
    setDistricts([]);
  };

  return (
    <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-6 min-w-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">City & District</h1>
          <p className="text-sm text-muted-foreground">
            Register cities once and manage their districts — like menu and submenu.
          </p>
        </div>

              <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!open && isSaving) return;
              if (!open) resetForm();
              setIsModalOpen(open);
            }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateModal} className="btn-category w-full sm:w-auto shrink-0">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add City
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentCity ? "Edit City" : "Add New City"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="name">
                    City Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mogadishu"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2 col-span-2 flex items-center justify-between border rounded-md p-4 bg-muted/20">
                  <div>
                    <Label htmlFor="default" className="text-base">
                      Default City
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Used as the default in search filters.
                    </p>
                  </div>
                  <Switch id="default" checked={isDefault} onCheckedChange={setIsDefault} />
                </div>
              </div>

              <div className="border bg-muted/10 p-4 rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center gap-2">
                    <NetworkIcon className="w-4 h-4" /> Districts / Degmo
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddDistrict}>
                    <PlusIcon className="w-4 h-4 mr-1" /> Add District
                  </Button>
                </div>

                {districts.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic text-center py-4">
                    No districts yet. Click Add District to register degmo for this city.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {districts.map((district, index) => (
                      <div key={index} className="flex gap-2 items-center bg-background p-2 rounded border">
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="District name (e.g. Hodan)"
                            value={district.name}
                            onChange={(e) => handleDistrictChange(index, "name", e.target.value)}
                            className="h-8"
                          />
                          <Input
                            placeholder="Order"
                            type="number"
                            value={district.order}
                            onChange={(e) => handleDistrictChange(index, "order", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          onClick={() => handleRemoveDistrict(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSaving} className="btn-category w-full md:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      {currentCity ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    currentCity ? "Update City" : "Create City"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Districts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span>Loading cities...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : cities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <MapPinIcon className="h-10 w-10 mb-2 opacity-20" />
                    <p>No cities registered yet. Add your first city.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cities.map((city) => (
                <TableRow key={city.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-muted-foreground">{city.id}</TableCell>
                  <TableCell className="font-semibold text-xs text-muted-foreground">
                    {city.order ?? 0}
                  </TableCell>
                  <TableCell className="font-bold text-sm">{city.name}</TableCell>
                  <TableCell>
                    {city.isDefault ? (
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {city.districts && city.districts.length > 0 ? (
                        city.districts.map((d) => (
                          <span
                            key={d.id}
                            className="bg-muted border text-muted-foreground px-1.5 py-0.5 rounded text-[10px]"
                          >
                            {d.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground opacity-50">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(city)}
                        disabled={isSaving || deletingId !== null}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(city.id)}
                        disabled={isSaving || deletingId === city.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      >
                        {deletingId === city.id ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
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
  );
}
