import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Users, Building2, Globe, ArrowUpDown, Map as MapIcon, List } from "lucide-react";
import { Link } from "wouter";
import type { AgencyProfile } from "@shared/schema";
import { LEGAL_AREAS } from "@shared/schema";
import { PartnerMap } from "@/components/partner-map";

type SortOption = "name-asc" | "name-desc" | "employees-asc" | "employees-desc" | "city";

export default function PartnerPoolPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const { data: agencies, isLoading } = useQuery<AgencyProfile[]>({
    queryKey: ["/api/agencies"],
  });

  const allCities = useMemo(() => {
    if (!agencies) return [];
    const set = new Set<string>();
    agencies.forEach((a) => {
      if (a.city) set.add(a.city);
      const offices = a.offices as Array<{ city: string }> | null;
      if (offices) offices.forEach((o) => { if (o.city) set.add(o.city); });
    });
    return Array.from(set).sort();
  }, [agencies]);

  const filtered = useMemo(() => {
    if (!agencies) return [];
    let result = [...agencies];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.city?.toLowerCase().includes(q) ||
          a.specialties?.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (specialtyFilter !== "all") {
      result = result.filter((a) => a.specialties?.includes(specialtyFilter));
    }
    if (cityFilter !== "all") {
      result = result.filter((a) => {
        if (a.city === cityFilter) return true;
        const offices = a.offices as Array<{ city: string }> | null;
        return offices?.some((o) => o.city === cityFilter) || false;
      });
    }

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "employees-asc":
        result.sort((a, b) => (a.employeeCount || 0) - (b.employeeCount || 0));
        break;
      case "employees-desc":
        result.sort((a, b) => (b.employeeCount || 0) - (a.employeeCount || 0));
        break;
      case "city":
        result.sort((a, b) => (a.city || "").localeCompare(b.city || ""));
        break;
    }

    return result;
  }, [agencies, search, sortBy, specialtyFilter, cityFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-partner-pool-title">Vertigogo Partners</h1>
        <p className="text-muted-foreground text-sm">Bläddra i vårt nätverk av kvalificerade advokatbyråer</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök efter namn, stad eller specialisering..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-partners"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-specialty">
            <SelectValue placeholder="Specialisering" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla specialiseringar</SelectItem>
            {LEGAL_AREAS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-city">
            <SelectValue placeholder="Stad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla städer</SelectItem>
            {allCities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[180px]" data-testid="select-sort">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Sortera efter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Namn A-Ö</SelectItem>
            <SelectItem value="name-desc">Namn Ö-A</SelectItem>
            <SelectItem value="employees-desc">Flest anställda</SelectItem>
            <SelectItem value="employees-asc">Färst anställda</SelectItem>
            <SelectItem value="city">Stad</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-md border overflow-visible">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-none no-default-hover-elevate no-default-active-elevate"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "map" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-none no-default-hover-elevate no-default-active-elevate"
            onClick={() => setViewMode("map")}
            data-testid="button-view-map"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : viewMode === "map" ? (
        <Card className="overflow-hidden" style={{ height: "500px" }}>
          <PartnerMap agencies={filtered} />
        </Card>
      ) : filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agency) => {
            const offices = agency.offices as Array<{ city: string }> | null;
            const allLocations = [agency.city, ...(offices?.map((o) => o.city) || [])].filter(Boolean);

            return (
              <Link key={agency.id} href={`/partners/${agency.id}`}>
                <Card className="p-4 hover-elevate cursor-pointer h-full" data-testid={`card-agency-${agency.id}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {agency.logoUrl ? (
                            <img src={agency.logoUrl} alt={agency.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate text-sm">{agency.name}</h3>
                          {allLocations.length > 0 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{allLocations.join(", ")}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {agency.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{agency.description}</p>
                    )}

                    {agency.specialties && agency.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agency.specialties.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                        {agency.specialties.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{agency.specialties.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {agency.employeeCount || 1} anställda
                      </span>
                      {agency.website && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Webbplats
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Inga advokatbyråer matchade dina kriterier.</p>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Visar {filtered.length} av {agencies?.length || 0} advokatbyråer
      </p>
    </div>
  );
}
