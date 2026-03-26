"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { generate3DView } from "@/lib/ai.action";
import { createProject, getProjectById } from "@/lib/puter.action";
import { useAuth } from "@/components/auth-provider";
import {
    BreakdownDialogs,
    CompareCard,
    ProjectSummary,
    RenderCard,
    VisualizerHeader,
} from "./visualizer-components";
import type {
    CityOption,
    DesignItem,
    MaterialDef,
    MaterialSummary,
    MaterialState,
    Supplier,
} from "./visualizer-types";

// Types and constants remain the same as in your original code

const CITY_OPTIONS: CityOption[] = [
    { id: "harare", name: "Harare", lat: -17.8252, lng: 31.0335 },
    { id: "bulawayo", name: "Bulawayo", lat: -20.1566, lng: 28.5896 },
    { id: "mutare", name: "Mutare", lat: -18.9707, lng: 32.6709 },
    { id: "gweru", name: "Gweru", lat: -19.45, lng: 29.8167 },
];

const SUPPLIERS: Supplier[] = [
    { id: "zbms", name: "Zimbabwe Building Materials Suppliers", city: "Harare", tags: ["cement", "bricks", "sand", "aggregate"] },
    { id: "chiff", name: "Chiff Bricks Supplies", city: "Harare", tags: ["bricks", "aggregate", "sand", "pavers"] },
    { id: "builders-joy", name: "Builders Joy Hardware & Brick Supplies", city: "Harare", tags: ["bricks", "aggregate", "sand", "pavers"] },
    { id: "palm-bricks", name: "Palm Bricks", city: "Mutare", tags: ["bricks", "blocks", "pavers"] },
    { id: "steel-centre", name: "Steel Centre International", city: "Harare", tags: ["roofing"] },
    { id: "halsteds", name: "Halsteds", city: "Bulawayo", tags: ["roofing"] },
    { id: "pg-centre", name: "PG Centre", city: "Harare", tags: ["timber"] },
    { id: "bromel", name: "Bromel Hardware", city: "Harare", tags: ["plumbing", "electrical", "paint", "timber", "roofing"] },
    { id: "enersol", name: "Enersol Hardware", city: "Harare", tags: ["plumbing", "electrical", "paint"] },
    { id: "greenlight", name: "Greenlight Electricals", city: "Harare", tags: ["electrical"] },
    { id: "gidsmartz", name: "GIDS-MARTZ Industrial Suppliers", city: "Bulawayo", tags: ["electrical"] },
];

const MATERIALS: MaterialDef[] = [
    {
        id: "cement",
        name: "Cement (50kg bag)",
        unit: "bag",
        defaultQty: 322,
        quotes: [
            { supplierId: "zbms", unitPriceUSD: 12, unitLabel: "per bag", sourceLabel: "ZBMS" },
        ],
    },
    {
        id: "bricks",
        name: "Common Bricks",
        unit: "1,000 bricks",
        defaultQty: 35,
        quotes: [
            { supplierId: "builders-joy", unitPriceUSD: 95, unitLabel: "per 1,000", sourceLabel: "Builders Joy" },
            { supplierId: "chiff", unitPriceUSD: 100, unitLabel: "per 1,000", sourceLabel: "Chiff Bricks" },
            { supplierId: "zbms", unitPriceUSD: 100, unitLabel: "per 1,000", sourceLabel: "ZBMS" },
            { supplierId: "palm-bricks", unitPriceUSD: 160, unitLabel: "per 1,000", sourceLabel: "Palm Bricks" },
        ],
    },
    {
        id: "sand",
        name: "Riversand",
        unit: "m3",
        defaultQty: 24,
        quotes: [
            { supplierId: "zbms", unitPriceUSD: 15, unitLabel: "per m3", sourceLabel: "ZBMS" },
            { supplierId: "chiff", unitPriceUSD: 20, unitLabel: "per m3", sourceLabel: "Chiff Bricks" },
            { supplierId: "builders-joy", unitPriceUSD: 20, unitLabel: "per m3", sourceLabel: "Builders Joy" },
        ],
    },
    {
        id: "aggregate",
        name: "3/4 Stone Aggregate",
        unit: "m3",
        defaultQty: 18,
        quotes: [
            { supplierId: "zbms", unitPriceUSD: 20, unitLabel: "per m3", sourceLabel: "ZBMS" },
            { supplierId: "chiff", unitPriceUSD: 20, unitLabel: "per m3", sourceLabel: "Chiff Bricks" },
            { supplierId: "builders-joy", unitPriceUSD: 20, unitLabel: "per m3", sourceLabel: "Builders Joy" },
        ],
    },
    {
        id: "roofing",
        name: "IBR Roofing Sheet (3.6m)",
        unit: "sheet",
        defaultQty: 120,
        quotes: [
            { supplierId: "steel-centre", unitPriceUSD: 7, unitLabel: "per sheet (3.6m)", sourceLabel: "Steel Centre" },
            { supplierId: "halsteds", unitPriceUSD: 16.13, unitLabel: "per sheet (3.6m)", sourceLabel: "Halsteds" },
        ],
    },
    {
        id: "timber",
        name: "Timber (Pine 38x152)",
        unit: "meter",
        defaultQty: 240,
        quotes: [
            { supplierId: "pg-centre", unitPriceUSD: 3.97, unitLabel: "per meter", sourceLabel: "PG Centre" },
        ],
    },
    {
        id: "rebar",
        name: "Rebar (10-12mm)",
        unit: "ton",
        defaultQty: 1.4,
        quotes: [
            { supplierId: "bromel", unitPriceUSD: null, unitLabel: "per ton" },
        ],
    },
    {
        id: "plumbing",
        name: "Plumbing Materials",
        unit: "set",
        defaultQty: 1,
        quotes: [
            { supplierId: "enersol", unitPriceUSD: null, unitLabel: "per set" },
            { supplierId: "bromel", unitPriceUSD: null, unitLabel: "per set" },
        ],
    },
    {
        id: "electrical",
        name: "Electrical Materials",
        unit: "set",
        defaultQty: 1,
        quotes: [
            { supplierId: "greenlight", unitPriceUSD: null, unitLabel: "per set" },
            { supplierId: "gidsmartz", unitPriceUSD: null, unitLabel: "per set" },
        ],
    },
    {
        id: "paint",
        name: "Paint & Finishes",
        unit: "set",
        defaultQty: 1,
        quotes: [
            { supplierId: "bromel", unitPriceUSD: null, unitLabel: "per set" },
            { supplierId: "enersol", unitPriceUSD: null, unitLabel: "per set" },
        ],
    },
];

const MATERIAL_PROVIDERS = [
    { id: "zim-core", name: "Zim Core Materials", multiplier: 1.0, note: "Standard mix" },
    { id: "harare-build", name: "Harare Build Supply", multiplier: 1.08, note: "Premium finishes" },
    { id: "bulawayo-trade", name: "Bulawayo Trade Depot", multiplier: 0.94, note: "Value option" },
    { id: "northern-aggregate", name: "Northern Aggregate Co.", multiplier: 1.15, note: "High-grade structural" },
];


export default function VisualizerPage() {
    const params = useParams();
    const router = useRouter();
    const { userId } = useAuth(); // Use the auth context instead of useOutletContext
    const id = params.id as string;

    const hasInitialGenerated = useRef(false);

    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const [squareFeet, setSquareFeet] = useState(1800);
    const [bedrooms, setBedrooms] = useState(3);
    const [staticPrice, setStaticPrice] = useState(8500);
    const [ratePerSqft, setRatePerSqft] = useState(38);
    const [bedroomPremium, setBedroomPremium] = useState(2500);
    const [selectedCityId, setSelectedCityId] = useState("harare");
    const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "denied" | "unavailable">("idle");
    const [showAllSuppliers, setShowAllSuppliers] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(0);
    const [isEstimateOpen, setIsEstimateOpen] = useState(false);
    const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
    const [materialState, setMaterialState] = useState<Record<string, MaterialState>>(() => Object.fromEntries(
        MATERIALS.map((material) => [
            material.id,
            {
                qty: material.defaultQty,
                supplierId: material.quotes[0]?.supplierId ?? null,
                prices: Object.fromEntries(material.quotes.map((quote) => [quote.supplierId, quote.unitPriceUSD])),
            },
        ])
    ));

    const handleBack = () => router.push('/');

    const handleExport = () => {
        if (!currentImage) return;

        const baseName = `dorm-${id || 'design'}`;

        const downloadViaLink = (href: string, filename: string) => {
            const link = document.createElement('a');
            link.href = href;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        void (async () => {
            try {
                const res = await fetch(currentImage);
                if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);

                const blob = await res.blob();
                const mime = (blob.type || res.headers.get('content-type') || '').toLowerCase();

                const ext =
                    mime.includes('png') ? 'png' :
                        mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' :
                            mime.includes('webp') ? 'webp' :
                                'png';

                const objectUrl = URL.createObjectURL(blob);
                try {
                    downloadViaLink(objectUrl, `${baseName}.${ext}`);
                } finally {
                    URL.revokeObjectURL(objectUrl);
                }
            } catch (e) {
                console.error('Export failed, falling back to direct link:', e);
                downloadViaLink(currentImage, `${baseName}.png`);
            }
        })();
    };

    const runGeneration = async (item: DesignItem) => {
        if (!id || !item.sourceImage) return;

        try {
            setIsProcessing(true);
            const result = await generate3DView({ sourceImage: item.sourceImage });

            if (result.renderedImage) {
                setCurrentImage(result.renderedImage);

                const updatedItem = {
                    ...item,
                    renderedImage: result.renderedImage,
                    renderedPath: result.renderedPath,
                    timestamp: Date.now(),
                    ownerId: item.ownerId ?? userId ?? null,
                    isPublic: item.isPublic ?? false,
                };

                const saved = await createProject({ item: updatedItem, visibility: "private" });

                if (saved) {
                    setProject(saved);
                    setCurrentImage(saved.renderedImage || result.renderedImage);
                }
            }
        } catch (error) {
            console.error('Generation failed: ', error);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadProject = async () => {
            if (!id) {
                setIsProjectLoading(false);
                return;
            }

            setIsProjectLoading(true);

            const fetchedProject = await getProjectById({ id });

            if (!isMounted) return;

            setProject(fetchedProject);
            setCurrentImage(fetchedProject?.renderedImage || null);
            setIsProjectLoading(false);
            hasInitialGenerated.current = false;
        };

        loadProject();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (
            isProjectLoading ||
            hasInitialGenerated.current ||
            !project?.sourceImage
        )
            return;

        if (project.renderedImage) {
            setCurrentImage(project.renderedImage);
            hasInitialGenerated.current = true;
            return;
        }

        hasInitialGenerated.current = true;
        void runGeneration(project);
    }, [project, isProjectLoading]);

    // All the helper functions remain the same
    const isEstimateReady = !!currentImage && !isProcessing;
    const sanitizedSqft = Math.max(200, Number.isFinite(squareFeet) ? squareFeet : 0);
    const sanitizedBedrooms = Math.max(0, Number.isFinite(bedrooms) ? bedrooms : 0);
    const sanitizedStatic = Math.max(0, Number.isFinite(staticPrice) ? staticPrice : 0);
    const sanitizedRate = Math.max(1, Number.isFinite(ratePerSqft) ? ratePerSqft : 0);
    const sanitizedBedroomPremium = Math.max(0, Number.isFinite(bedroomPremium) ? bedroomPremium : 0);
    const baseEstimate = sanitizedSqft * sanitizedRate + sanitizedBedrooms * sanitizedBedroomPremium + sanitizedStatic;
    const providerEstimates = MATERIAL_PROVIDERS.map((provider) => ({
        ...provider,
        total: Math.round(baseEstimate * provider.multiplier),
    }));
    const lowestEstimate = providerEstimates.reduce((prev, current) => (current.total < prev.total ? current : prev));
    const highestEstimate = providerEstimates.reduce((prev, current) => (current.total > prev.total ? current : prev));
    const estimateDelta = highestEstimate.total - lowestEstimate.total;
    const activeCity = CITY_OPTIONS.find((city) => city.id === selectedCityId) ?? CITY_OPTIONS[0];

    const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const radius = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setGeoStatus("unavailable");
            return;
        }

        setGeoStatus("locating");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const nearest = CITY_OPTIONS.reduce((closest, city) => {
                    const distance = getDistanceKm(latitude, longitude, city.lat, city.lng);
                    if (!closest || distance < closest.distance) {
                        return { city, distance };
                    }
                    return closest;
                }, null as { city: CityOption; distance: number } | null);

                if (nearest) {
                    setSelectedCityId(nearest.city.id);
                }
                setGeoStatus("idle");
            },
            () => {
                setGeoStatus("denied");
            }
        );
    };

    const handleMaterialQtyChange = (materialId: string, value: number) => {
        setMaterialState((prev) => ({
            ...prev,
            [materialId]: {
                ...prev[materialId],
                qty: value,
            },
        }));
    };

    const handleMaterialSupplierChange = (materialId: string, supplierId: string) => {
        setMaterialState((prev) => ({
            ...prev,
            [materialId]: {
                ...prev[materialId],
                supplierId,
            },
        }));
    };

    const handleMaterialPriceChange = (materialId: string, supplierId: string, value: number | null) => {
        setMaterialState((prev) => ({
            ...prev,
            [materialId]: {
                ...prev[materialId],
                prices: {
                    ...prev[materialId].prices,
                    [supplierId]: value,
                },
            },
        }));
    };

    const materialSummaries: MaterialSummary[] = MATERIALS.map((material) => {
        const state = materialState[material.id];
        const selectedSupplierId = state?.supplierId;
        const selectedPrice = selectedSupplierId ? state?.prices[selectedSupplierId] ?? null : null;
        const totalUSD = selectedPrice !== null ? selectedPrice * (state?.qty ?? 0) : null;
        const priceValues = material.quotes
            .map((quote) => state?.prices[quote.supplierId])
            .filter((value): value is number => typeof value === "number");
        const minPrice = priceValues.length ? Math.min(...priceValues) : null;
        const maxPrice = priceValues.length ? Math.max(...priceValues) : null;

        return {
            material,
            state,
            selectedSupplierId,
            selectedPrice,
            totalUSD,
            minPrice,
            maxPrice,
        };
    });

    const materialTotalUSD = materialSummaries.reduce((sum, item) => sum + (item.totalUSD ?? 0), 0);
    const missingPriceCount = materialSummaries.filter((item) => item.selectedPrice === null).length;
    const exchangeRateValue = exchangeRate > 0 ? exchangeRate : null;

    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            <VisualizerHeader
                onExport={handleExport}
                onShare={() => {}}
                onExit={handleBack}
                exportDisabled={!currentImage}
                breakdowns={
                    <BreakdownDialogs
                        isEstimateOpen={isEstimateOpen}
                        setIsEstimateOpen={setIsEstimateOpen}
                        isMaterialsOpen={isMaterialsOpen}
                        setIsMaterialsOpen={setIsMaterialsOpen}
                        isEstimateReady={isEstimateReady}
                        squareFeet={squareFeet}
                        bedrooms={bedrooms}
                        ratePerSqft={ratePerSqft}
                        bedroomPremium={bedroomPremium}
                        staticPrice={staticPrice}
                        setSquareFeet={setSquareFeet}
                        setBedrooms={setBedrooms}
                        setRatePerSqft={setRatePerSqft}
                        setBedroomPremium={setBedroomPremium}
                        setStaticPrice={setStaticPrice}
                        baseEstimate={baseEstimate}
                        lowestEstimate={lowestEstimate}
                        highestEstimate={highestEstimate}
                        estimateDelta={estimateDelta}
                        providerEstimates={providerEstimates}
                        selectedCityId={selectedCityId}
                        setSelectedCityId={setSelectedCityId}
                        exchangeRate={exchangeRate}
                        setExchangeRate={setExchangeRate}
                        handleUseMyLocation={handleUseMyLocation}
                        geoStatus={geoStatus}
                        showAllSuppliers={showAllSuppliers}
                        setShowAllSuppliers={setShowAllSuppliers}
                        materialTotalUSD={materialTotalUSD}
                        missingPriceCount={missingPriceCount}
                        exchangeRateValue={exchangeRateValue}
                        materialSummaries={materialSummaries}
                        suppliers={SUPPLIERS}
                        cityOptions={CITY_OPTIONS}
                        activeCity={activeCity}
                        handleMaterialQtyChange={handleMaterialQtyChange}
                        handleMaterialSupplierChange={handleMaterialSupplierChange}
                        handleMaterialPriceChange={handleMaterialPriceChange}
                    />
                }
            />

            <main className="w-full px-6 py-8">
                <ProjectSummary name={project?.name || `Residence ${id}`} />
                <div className="w-full">
                    <div className="flex w-full flex-col gap-6">
                        <RenderCard
                            currentImage={currentImage}
                            sourceImage={project?.sourceImage}
                            isProcessing={isProcessing}
                        />
                        <CompareCard
                            currentImage={currentImage}
                            sourceImage={project?.sourceImage}
                        />
                    </div>
                </div>
            </main>

            {/*
            <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
                <div className="flex w-full items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <HousePlus className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold tracking-tight">ImbaAI Studio</span>
                        <Badge variant="secondary" className="ml-2 hidden md:inline-flex">Visualizer</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleExport} disabled={!currentImage}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {}}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
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
                                                <p className="text-xs uppercase tracking-widest text-muted-foreground">Base Estimate</p>
                                                <p className="text-2xl font-semibold">${baseEstimate.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">Before provider pricing adjustments.</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="border border-border/60 bg-muted/20">
                                            <CardContent className="space-y-1 pt-5">
                                                <p className="text-xs uppercase tracking-widest text-muted-foreground">Comparison</p>
                                                <p className="text-2xl font-semibold">
                                                    ${lowestEstimate.total.toLocaleString()} - ${highestEstimate.total.toLocaleString()}
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
                                                    <p className="text-xs text-muted-foreground">{provider.note}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">Total</p>
                                                    <p className="text-lg font-semibold">${provider.total.toLocaleString()}</p>
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
                                                    {CITY_OPTIONS.map((city) => (
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
                                                    <p className="text-xs text-muted-foreground">Filter by nearby vendors.</p>
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
                                                        <span className="text-xs text-muted-foreground">Show all</span>
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
                                                <p className="text-xs uppercase tracking-widest text-muted-foreground">Materials Subtotal (USD)</p>
                                                <p className="text-2xl font-semibold">${materialTotalUSD.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {missingPriceCount > 0
                                                        ? `${missingPriceCount} item(s) still need prices.`
                                                        : "All selected items priced."}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card className="border border-border/60 bg-muted/20">
                                            <CardContent className="space-y-1 pt-5">
                                                <p className="text-xs uppercase tracking-widest text-muted-foreground">Materials Subtotal (ZWL)</p>
                                                <p className="text-2xl font-semibold">
                                                    {exchangeRateValue
                                                        ? `ZWL ${(materialTotalUSD * exchangeRateValue).toLocaleString()}`
                                                        : "Set exchange rate"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {exchangeRateValue ? `Rate: ${exchangeRateValue.toLocaleString()} ZWL per USD` : "Enter USD to ZWL rate."}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        {materialSummaries.map(({ material, state, selectedSupplierId, selectedPrice, totalUSD, minPrice, maxPrice }) => {
                                            const visibleQuotes = material.quotes.filter((quote) => {
                                                const supplier = SUPPLIERS.find((s) => s.id === quote.supplierId);
                                                if (!supplier) return false;
                                                if (showAllSuppliers) return true;
                                                return supplier.city === activeCity.name || supplier.city === "Multiple";
                                            });

                                            const quotesToShow = visibleQuotes.length ? visibleQuotes : material.quotes;

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
                                                                onChange={(e) => handleMaterialQtyChange(material.id, Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="space-y-3">
                                                            {quotesToShow.map((quote) => {
                                                                const supplier = SUPPLIERS.find((s) => s.id === quote.supplierId);
                                                                const priceValue = state?.prices[quote.supplierId] ?? null;
                                                                const isSelected = selectedSupplierId === quote.supplierId;

                                                                return (
                                                                    <label
                                                                        key={quote.supplierId}
                                                                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${
                                                                            isSelected ? "border-primary/60 bg-primary/5" : "border-border/60"
                                                                        }`}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name={`${material.id}-supplier`}
                                                                            className="mt-1 h-4 w-4 accent-primary"
                                                                            checked={isSelected}
                                                                            onChange={() => handleMaterialSupplierChange(material.id, quote.supplierId)}
                                                                        />
                                                                        <div className="flex-1 space-y-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <div>
                                                                                    <p className="text-sm font-medium">{supplier?.name ?? quote.supplierId}</p>
                                                                                    <p className="text-xs text-muted-foreground">{supplier?.city ?? "Zimbabwe"}</p>
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
                                                                                <p className="text-xs text-muted-foreground">Source: {quote.sourceLabel}</p>
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
                                        })}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={handleBack}>
                            <X className="mr-2 h-4 w-4" />
                            Exit
                        </Button>
                    </div>
                </div>
            </header>

            <main className="w-full px-6 py-8">
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Project</p>
                    <h1 className="text-2xl font-semibold">{project?.name || `Residence ${id}`}</h1>
                    <p className="text-sm text-muted-foreground">Created by you</p>
                </div>

                <div className="w-full">
                    <div className="flex w-full flex-col gap-6">
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
                                        <img src={currentImage} alt="AI Render" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                            {project?.sourceImage ? (
                                                <img src={project?.sourceImage} alt="Original" className="max-h-full max-w-full object-contain opacity-80" />
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
                                                <span className="text-xs text-muted-foreground">Generating your 3D visualization</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

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
                                    {project?.sourceImage && currentImage ? (
                                        <ReactCompareSlider
                                            defaultValue={50}
                                            style={{ width: "100%", height: "100%" }}
                                            itemOne={
                                                <ReactCompareSliderImage
                                                    src={project?.sourceImage}
                                                    alt="before"
                                                    className="h-full w-full object-contain bg-white"
                                                    style={{ objectFit: "contain", objectPosition: "center" }}
                                                />
                                            }
                                            itemTwo={
                                                <ReactCompareSliderImage
                                                    src={currentImage || project?.renderedImage}
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
                    </div>

                </div>
            </main>
            */}
        </div>
    );
}
