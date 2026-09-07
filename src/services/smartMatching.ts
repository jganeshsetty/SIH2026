import { Crop, BuyerDemand, MatchingResult, FPOBulkOffer } from '../types';

/**
 * Calculates straight-line distance in kilometers between two lat/lng pairs using the Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Computes a transparent 0-100% Match Score between a Crop listing (or FPO offer) and a Buyer Demand requirement.
 */
export function computeSmartMatchScore(
  crop: Crop | FPOBulkOffer,
  demand: BuyerDemand
): MatchingResult {
  const reasons: string[] = [];

  // 1. Crop Name Match (Weight: 25%)
  const crop1 = ('name' in crop ? crop.name : crop.cropName).toLowerCase();
  const crop2 = demand.cropName.toLowerCase();
  let cropScore = 0;
  if (crop1 === crop2 || crop1.includes(crop2) || crop2.includes(crop1)) {
    cropScore = 100;
    reasons.push('Direct crop match');
  } else {
    cropScore = 20;
  }

  // 2. Quantity Score (Weight: 20%)
  const supplyQty = 'quantity' in crop ? crop.quantity : crop.totalQuantity;
  const demandQty = demand.requiredQuantity;
  let quantityScore = 0;
  if (supplyQty >= demandQty) {
    quantityScore = 100;
    reasons.push('Fulfills 100%+ of requested buyer quantity');
  } else {
    const ratio = supplyQty / demandQty;
    quantityScore = Math.round(ratio * 100);
    reasons.push(`Fulfills ${Math.round(ratio * 100)}% of requested volume`);
  }

  // 3. Quality / Grade Match (Weight: 20%)
  const supplyGrade = ('quality' in crop ? crop.quality : crop.grade).toLowerCase();
  const demandGrade = demand.requiredGrade.toLowerCase();
  let gradeScore = 80;
  if (supplyGrade === demandGrade || supplyGrade.includes('grade a') || supplyGrade.includes('organic')) {
    gradeScore = 100;
    reasons.push('Quality & grade requirement satisfied');
  } else {
    reasons.push('Grade specs closely compatible');
  }

  // 4. Price Alignment Score (Weight: 20%)
  const askingPrice = 'expectedPrice' in crop ? crop.expectedPrice : crop.askingPricePerUnit;
  let priceScore = 0;
  if (askingPrice >= demand.targetMinPrice && askingPrice <= demand.targetMaxPrice) {
    priceScore = 100;
    reasons.push('Price falls within buyer target range');
  } else if (askingPrice < demand.targetMinPrice) {
    priceScore = 95; // Farmer offering a discount to buyer
    reasons.push('Price is below buyer maximum budget (Great value)');
  } else {
    const diffPercent = ((askingPrice - demand.targetMaxPrice) / demand.targetMaxPrice) * 100;
    priceScore = Math.max(10, Math.round(100 - diffPercent * 2));
    reasons.push(`Price is ${Math.round(diffPercent)}% above buyer target`);
  }

  // 5. Geographical Distance Score (Weight: 15%)
  const cropLat = crop.lat || 19.0760;
  const cropLng = crop.lng || 73.0048;
  const distanceKm = calculateHaversineDistance(cropLat, cropLng, demand.lat, demand.lng);
  
  let locationScore = 100;
  if (distanceKm <= 50) {
    locationScore = 100;
    reasons.push(`Hyper-local freight (< 50 km distance)`);
  } else if (distanceKm <= 200) {
    locationScore = 85;
    reasons.push(`Regional freight (~${distanceKm} km distance)`);
  } else if (distanceKm <= 500) {
    locationScore = 65;
    reasons.push(`Inter-district highway transit (~${distanceKm} km)`);
  } else {
    locationScore = 40;
    reasons.push(`Long-distance freight (${distanceKm} km)`);
  }

  // Final Weighted Calculation
  const totalScore = Math.round(
    cropScore * 0.25 +
    quantityScore * 0.20 +
    gradeScore * 0.20 +
    priceScore * 0.20 +
    locationScore * 0.15
  );

  return {
    matchScore: totalScore,
    cropScore,
    quantityScore,
    gradeScore,
    priceScore,
    locationScore,
    dateScore: 90,
    distanceKm,
    reasons
  };
}
