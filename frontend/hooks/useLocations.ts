"use client";

import { useEffect, useState } from "react";
import { getCities, City } from "@/api/cityApi";
import {
  toCityOptions,
  getDefaultCityName,
  getDistrictOptionsForCity,
  cityHasDistricts,
  getCityNames,
  SelectOption,
} from "@/lib/locationUtils";

let cachedCities: City[] | null = null;
let cachePromise: Promise<City[]> | null = null;

function fetchCities(): Promise<City[]> {
  if (cachedCities) return Promise.resolve(cachedCities);
  if (!cachePromise) {
    cachePromise = getCities()
      .then((data) => {
        cachedCities = data;
        return data;
      })
      .catch(() => {
        cachePromise = null;
        return [] as City[];
      });
  }
  return cachePromise;
}

export function invalidateLocationsCache() {
  cachedCities = null;
  cachePromise = null;
}

export function useLocations() {
  const [cities, setCities] = useState<City[]>(cachedCities || []);
  const [loading, setLoading] = useState(!cachedCities);

  useEffect(() => {
    let active = true;
    fetchCities().then((data) => {
      if (active) setCities(data);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const cityOptions = toCityOptions(cities);
  const defaultCity = getDefaultCityName(cities);
  const citiesWithDistricts = cities.filter((c) => (c.districts?.length || 0) > 0).map((c) => c.name);

  return {
    cities,
    loading,
    cityOptions,
    defaultCity,
    citiesWithDistricts,
    cityNames: getCityNames(cities),
    getDistrictOptions: (cityName: string): SelectOption[] =>
      getDistrictOptionsForCity(cities, cityName),
    cityHasDistricts: (cityName: string) => cityHasDistricts(cities, cityName),
  };
}
