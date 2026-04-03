"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { InfluencerFilters } from "./InfluencerFilters";

export function MobileFilterDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <div className="lg:hidden inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <InfluencerFilters onApply={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
