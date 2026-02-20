import { Timestamp } from 'firebase/firestore';

export type Role = 'farmer' | 'buyer';
export type Language = 'te' | 'hi' | 'en';
export type CropType = 'paddy' | 'cotton' | 'maize' | 'turmeric' | 'red_chilli';
export type SoilType = 'black_cotton' | 'red_loam';
export type FarmerStatus = 'growing' | 'harvested' | 'stored' | 'transported' | 'sold';
export type HarvestWeek = 1 | 2 | 3;
export type SupplyLevel = 'green' | 'yellow' | 'red';

export interface UserDoc {
    uid: string;
    name: string;
    phone: string;
    role: Role;
    district: string;
    mandal: string;
    language: Language;
    createdAt: Timestamp;
}

export interface FarmerDoc {
    uid: string;
    crop: CropType;
    variety: string;
    sownDate: string; // ISO date
    fieldSize_acres: number;
    soilType: SoilType;
    district: string;
    mandal: string;
    expectedQtl: number | null;
    quantityConfirmed: boolean;
    viability_days: number;
    harvestWeek: HarvestWeek;
    status: FarmerStatus;
    estimatedPrice: number | null;
    actualPrice: number | null;
}

export interface BuyerDoc {
    uid: string;
    businessName: string;
    district: string;
    phone: string;
}

export interface BuyerListing {
    listingId: string;
    buyerUid: string;
    crop: CropType;
    variety: string;
    quantityQtl: number;
    targetDate: string;
    pricePerQtl: number;
    district: string;
    isBelowMSP: boolean;
    status: 'open' | 'matched' | 'closed';
    postedAt: Timestamp;
}

export interface Match {
    matchId: string;
    farmerUid: string;
    buyerUid: string;
    listingId: string;
    crop: string;
    quantityQtl: number;
    pricePerQtl: number;
    matchedAt: Timestamp;
}

export interface HarvestCalendar {
    mandal: string;
    crop: string;
    week: HarvestWeek;
    farmerCount: number;
    farmerUids: string[];
    updatedAt: Timestamp;
}

export interface MSPValue {
    crop: string;
    pricePerQtl: number;
    season: string;
    updatedAt: Timestamp;
}

export interface AICache {
    uid: string;
    promptType: 'harvest' | 'quantity' | 'sell';
    input_hash: string;
    response: object;
    cachedAt: Timestamp;
}
