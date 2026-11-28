export interface LandingProofItem {
  id: string;
  restaurantName: string;
  city?: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  logoUrl?: string;
  photoUrl?: string;
}

/**
 * Verified customer testimonials, restaurant logos, and case studies.
 * Keep empty until approved proof data is available; ProofSection hides
 * itself automatically whenever this array is empty.
 */
export const LANDING_PROOF_ITEMS: LandingProofItem[] = [];
