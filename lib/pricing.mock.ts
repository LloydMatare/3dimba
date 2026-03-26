type PricingSnapshot = {
    cityId: string;
    updatedAt: number;
    prices: Record<string, Record<string, number | null>>;
};

const CITY_MULTIPLIER: Record<string, number> = {
    harare: 1,
    bulawayo: 1.07,
    mutare: 1.04,
    gweru: 1.05,
};

const BASE_PRICE_MATRIX: Record<string, Record<string, number | null>> = {
    cement: {
        zbms: 12,
    },
    bricks: {
        "builders-joy": 95,
        chiff: 100,
        zbms: 100,
        "palm-bricks": 160,
    },
    sand: {
        zbms: 15,
        chiff: 20,
        "builders-joy": 20,
    },
    aggregate: {
        zbms: 20,
        chiff: 20,
        "builders-joy": 20,
    },
    roofing: {
        "steel-centre": 7,
        halsteds: 16.13,
    },
    timber: {
        "pg-centre": 3.97,
    },
    rebar: {
        bromel: 920,
    },
    plumbing: {
        enersol: 1250,
        bromel: 1180,
    },
    electrical: {
        greenlight: 1400,
        gidsmartz: 1350,
    },
    paint: {
        bromel: 980,
        enersol: 920,
    },
};

const roundPrice = (value: number) => Math.round(value * 100) / 100;

export const getMockPricingSnapshot = async (cityId: string): Promise<PricingSnapshot> => {
    const multiplier = CITY_MULTIPLIER[cityId] ?? 1;

    const prices = Object.fromEntries(
        Object.entries(BASE_PRICE_MATRIX).map(([materialId, suppliers]) => [
            materialId,
            Object.fromEntries(
                Object.entries(suppliers).map(([supplierId, price]) => [
                    supplierId,
                    typeof price === "number" ? roundPrice(price * multiplier) : null,
                ])
            ),
        ])
    ) as Record<string, Record<string, number | null>>;

    await new Promise((resolve) => setTimeout(resolve, 450));

    return {
        cityId,
        updatedAt: Date.now(),
        prices,
    };
};

export type { PricingSnapshot };
