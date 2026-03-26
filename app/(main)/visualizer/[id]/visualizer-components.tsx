//@ts-nocheck
"use client";

import * as React from "react";
import { Download, HousePlus, RefreshCcw, Share2, X } from "lucide-react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { CityOption, MaterialSummary, Supplier } from "./visualizer-types";

type VisualizerHeaderProps = {
  onExport: () => void;
  onShare: () => void;
  onExit: () => void;
  exportDisabled: boolean;
  breakdowns: React.ReactNode;
};

export function VisualizerHeader({
  onExport,
  onShare,
  onExit,
  exportDisabled,
  breakdowns,
}: VisualizerHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <HousePlus className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            ImbaAI Studio
          </span>
          <Badge variant="secondary" className="ml-2 hidden md:inline-flex">
            Visualizer
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={exportDisabled}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          {breakdowns}
          <Button variant="ghost" size="sm" onClick={onExit}>
            <X className="mr-2 h-4 w-4" />
            Exit
          </Button>
        </div>
      </div>
    </header>
  );
}

export function ProjectSummary({ name }: { name: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Project
      </p>
      <h1 className="text-2xl font-semibold">{name}</h1>
      <p className="text-sm text-muted-foreground">Created by you</p>
    </div>
  );
}

type RenderCardProps = {
  currentImage: string | null;
  sourceImage?: string;
  isProcessing: boolean;
};

export function RenderCard({
  currentImage,
  sourceImage,
  isProcessing,
}: RenderCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">3D Render</CardTitle>
        <p className="text-sm text-muted-foreground">
          Generated visualization based on your floor plan.
        </p>
      </CardHeader>
      <CardContent className="relative">
        <div className="relative flex h-[70vh] min-h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background p-3">
          {currentImage ? (
            <img
              src={currentImage}
              alt="AI Render"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {sourceImage ? (
                <img
                  src={sourceImage}
                  alt="Original"
                  className="max-h-full max-w-full object-contain opacity-80"
                />
              ) : (
                "Waiting for render"
              )}
            </div>
          )}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur">
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card px-6 py-4 text-center">
                <RefreshCcw className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Rendering...</span>
                <span className="text-xs text-muted-foreground">
                  Generating your 3D visualization
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type CompareCardProps = {
  currentImage: string | null;
  sourceImage?: string;
};

export function CompareCard({ currentImage, sourceImage }: CompareCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Before and After</CardTitle>
          <p className="text-sm text-muted-foreground">Drag to compare the render.</p>
        </div>
        <Badge variant="outline">Compare</Badge>
      </CardHeader>
      <CardContent>
        <div className="aspect-[4/3] max-h-[65vh] w-full overflow-hidden rounded-2xl border border-border/60 bg-white">
          {sourceImage && currentImage ? (
            <ReactCompareSlider
              defaultValue={50}
              style={{ width: "100%", height: "100%" }}
              itemOne={
                <ReactCompareSliderImage
                  src={sourceImage}
                  alt="before"
                  className="h-full w-full object-contain bg-white"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={currentImage}
                  alt="after"
                  className="h-full w-full object-contain bg-white"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Add a source image to compare.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type BreakdownDialogsProps = {
  isEstimateOpen: boolean;
  setIsEstimateOpen: (value: boolean) => void;
  isMaterialsOpen: boolean;
  setIsMaterialsOpen: (value: boolean) => void;
  isEstimateReady: boolean;
  squareFeet: number;
  bedrooms: number;
  ratePerSqft: number;
  bedroomPremium: number;
  staticPrice: number;
  setSquareFeet: (value: number) => void;
  setBedrooms: (value: number) => void;
  setRatePerSqft: (value: number) => void;
  setBedroomPremium: (value: number) => void;
  setStaticPrice: (value: number) => void;
  baseEstimate: number;
  lowestEstimate: { total: number };
  highestEstimate: { total: number };
  estimateDelta: number;
  providerEstimates: { id: string; name: string; note: string; total: number }[];
  selectedCityId: string;
  setSelectedCityId: (value: string) => void;
  exchangeRate: number;
  setExchangeRate: (value: number) => void;
  handleUseMyLocation: () => void;
  geoStatus: "idle" | "locating" | "denied" | "unavailable";
  showAllSuppliers: boolean;
  setShowAllSuppliers: (value: boolean) => void;
  materialTotalUSD: number;
  missingPriceCount: number;
  exchangeRateValue: number | null;
  materialSummaries: MaterialSummary[];
  suppliers: Supplier[];
  cityOptions: CityOption[];
  activeCity: CityOption;
  handleMaterialQtyChange: (materialId: string, value: number) => void;
  handleMaterialSupplierChange: (materialId: string, supplierId: string) => void;
  handleMaterialPriceChange: (
    materialId: string,
    supplierId: string,
    value: number | null
  ) => void;
};

export function BreakdownDialogs({
  isEstimateOpen,
  setIsEstimateOpen,
  isMaterialsOpen,
  setIsMaterialsOpen,
  isEstimateReady,
  squareFeet,
  bedrooms,
  ratePerSqft,
  bedroomPremium,
  staticPrice,
  setSquareFeet,
  setBedrooms,
  setRatePerSqft,
  setBedroomPremium,
  setStaticPrice,
  baseEstimate,
  lowestEstimate,
  highestEstimate,
  estimateDelta,
  providerEstimates,
  selectedCityId,
  setSelectedCityId,
  exchangeRate,
  setExchangeRate,
  handleUseMyLocation,
  geoStatus,
  showAllSuppliers,
  setShowAllSuppliers,
  materialTotalUSD,
  missingPriceCount,
  exchangeRateValue,
  materialSummaries,
  suppliers,
  cityOptions,
  activeCity,
  handleMaterialQtyChange,
  handleMaterialSupplierChange,
  handleMaterialPriceChange,
}: BreakdownDialogsProps) {
  return (
    <>
      <Dialog open={isEstimateOpen} onOpenChange={setIsEstimateOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={!isEstimateReady}>
            Build Cost
          </Button>
        </DialogTrigger>
        <DialogContent className="no-scrollbar max-h-[85vh] w-[min(64vw,1100px)] max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Build Cost Projection</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Square Footage</Label>
                <Input
                  type="number"
                  min={200}
                  step={10}
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Rate per Sq Ft (USD)</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={ratePerSqft}
                  onChange={(e) => setRatePerSqft(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Bedroom Premium (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={bedroomPremium}
                  onChange={(e) => setBedroomPremium(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Static Fee (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={staticPrice}
                  onChange={(e) => setStaticPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border border-border/60 bg-muted/20">
                <CardContent className="space-y-1 pt-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Base Estimate
                  </p>
                  <p className="text-2xl font-semibold">
                    ${baseEstimate.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Before provider pricing adjustments.
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border/60 bg-muted/20">
                <CardContent className="space-y-1 pt-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Comparison
                  </p>
                  <p className="text-2xl font-semibold">
                    ${lowestEstimate.total.toLocaleString()} - $
                    {highestEstimate.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${estimateDelta.toLocaleString()} range across providers.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-3">
              {providerEstimates.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {provider.note}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">
                      ${provider.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMaterialsOpen} onOpenChange={setIsMaterialsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary" disabled={!isEstimateReady}>
            Materials
          </Button>
        </DialogTrigger>
        <DialogContent className="no-scrollbar max-h-[85vh] w-[min(64vw,1200px)] max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Material Breakdown & Supplier Quotes</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>USD to ZWL rate</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Suppliers</p>
                    <p className="text-xs text-muted-foreground">
                      Filter by nearby vendors.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleUseMyLocation}
                      disabled={geoStatus === "locating"}
                    >
                      {geoStatus === "locating" ? "Locating..." : "Use my location"}
                    </Button>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={showAllSuppliers}
                        onCheckedChange={setShowAllSuppliers}
                      />
                      <span className="text-xs text-muted-foreground">
                        Show all
                      </span>
                    </div>
                  </div>
                </div>
                {geoStatus === "denied" && (
                  <p className="text-xs text-destructive">
                    Location permission denied. Select a city manually.
                  </p>
                )}
                {geoStatus === "unavailable" && (
                  <p className="text-xs text-destructive">
                    Location is unavailable on this device.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border border-border/60 bg-muted/20">
                <CardContent className="space-y-1 pt-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Materials Subtotal (USD)
                  </p>
                  <p className="text-2xl font-semibold">
                    ${materialTotalUSD.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {missingPriceCount > 0
                      ? `${missingPriceCount} item(s) still need prices.`
                      : "All selected items priced."}
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border/60 bg-muted/20">
                <CardContent className="space-y-1 pt-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Materials Subtotal (ZWL)
                  </p>
                  <p className="text-2xl font-semibold">
                    {exchangeRateValue
                      ? `ZWL ${(materialTotalUSD * exchangeRateValue).toLocaleString()}`
                      : "Set exchange rate"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exchangeRateValue
                      ? `Rate: ${exchangeRateValue.toLocaleString()} ZWL per USD`
                      : "Enter USD to ZWL rate."}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-4">
              {materialSummaries.map(
                ({
                  material,
                  state,
                  selectedSupplierId,
                  minPrice,
                  maxPrice,
                  totalUSD,
                }) => {
                  const visibleQuotes = material.quotes.filter((quote) => {
                    const supplier = suppliers.find((s) => s.id === quote.supplierId);
                    if (!supplier) return false;
                    if (showAllSuppliers) return true;
                    return supplier.city === activeCity.name || supplier.city === "Multiple";
                  });

                  const quotesToShow = visibleQuotes.length
                    ? visibleQuotes
                    : material.quotes;

                  return (
                    <Card key={material.id} className="border border-border/60">
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{material.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{material.unit}</p>
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">Qty</Label>
                          <Input
                            type="number"
                            min={0}
                            step={material.unit === "ton" ? 0.1 : 1}
                            value={state?.qty ?? 0}
                            onChange={(e) =>
                              handleMaterialQtyChange(material.id, Number(e.target.value))
                            }
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {quotesToShow.map((quote) => {
                            const supplier = suppliers.find((s) => s.id === quote.supplierId);
                            const priceValue = state?.prices[quote.supplierId] ?? null;
                            const isSelected = selectedSupplierId === quote.supplierId;

                            return (
                              <label
                                key={quote.supplierId}
                                className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${
                                  isSelected
                                    ? "border-primary/60 bg-primary/5"
                                    : "border-border/60"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`${material.id}-supplier`}
                                  className="mt-1 h-4 w-4 accent-primary"
                                  checked={isSelected}
                                  onChange={() =>
                                    handleMaterialSupplierChange(material.id, quote.supplierId)
                                  }
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium">
                                        {supplier?.name ?? quote.supplierId}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {supplier?.city ?? "Zimbabwe"}
                                      </p>
                                    </div>
                                    <Badge variant="outline">{quote.unitLabel}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min={0}
                                      step={0.1}
                                      value={priceValue ?? ""}
                                      placeholder="Quote needed"
                                      onChange={(e) =>
                                        handleMaterialPriceChange(
                                          material.id,
                                          quote.supplierId,
                                          e.target.value === "" ? null : Number(e.target.value)
                                        )
                                      }
                                    />
                                  </div>
                                  {quote.sourceLabel && (
                                    <p className="text-xs text-muted-foreground">
                                      Source: {quote.sourceLabel}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Range</p>
                            <p className="text-sm font-semibold">
                              {minPrice !== null && maxPrice !== null
                                ? `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`
                                : "No priced quotes"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Selected Total</p>
                            <p className="text-sm font-semibold">
                              {totalUSD !== null ? `$${totalUSD.toLocaleString()}` : "Add price"}
                            </p>
                            {exchangeRateValue && totalUSD !== null && (
                              <p className="text-xs text-muted-foreground">
                                ZWL {(totalUSD * exchangeRateValue).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
