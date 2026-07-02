import type { City } from "@/api/cityApi";

export type SelectOption = { value: string; label: string };

export function toCityOptions(cities: City[]): SelectOption[] {
  return cities.map((c) => ({ value: c.name, label: c.name }));
}

export function getDefaultCityName(cities: City[]): string {
  return cities.find((c) => c.isDefault)?.name || cities[0]?.name || "Mogadishu";
}

export function findCity(cities: City[], cityName: string): City | undefined {
  const normalized = cityName.toLowerCase();
  return cities.find((c) => c.name.toLowerCase() === normalized);
}

export function getDistrictOptionsForCity(cities: City[], cityName: string): SelectOption[] {
  const city = findCity(cities, cityName);
  return (city?.districts || []).map((d) => ({ value: d.name, label: d.name }));
}

export function cityHasDistricts(cities: City[], cityName: string): boolean {
  return getDistrictOptionsForCity(cities, cityName).length > 0;
}

export function getCityNames(cities: City[]): string[] {
  return cities.map((c) => c.name);
}
