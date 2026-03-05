import type { ApiDealResponse } from "@/components/DealCard";

export interface ComparisonFeature {
    name: string;
    brandAValue: string;
    brandBValue: string;
    winner?: 'brandA' | 'brandB' | 'tie';
}

export interface ComparisonMatrix {
    brandA: {
        name: string;
        slug: string;
    };
    brandB: {
        name: string;
        slug: string;
    };
    features: ComparisonFeature[];
    overallWinner?: 'brandA' | 'brandB' | 'tie';
}

export interface UseCaseRecommendation {
    brand: 'A' | 'B';
    scenarios: string[];
}

/**
 * Builds a comparison matrix between two brands' student discounts
 */
export function buildComparisonMatrix(params: {
    brandA: { name: string; slug: string };
    brandB: { name: string; slug: string };
    dealA: ApiDealResponse['deal'];
    dealB: ApiDealResponse['deal'];
}): ComparisonMatrix {
    const { brandA, brandB, dealA, dealB } = params;

    const features: ComparisonFeature[] = [];

    // Discount percentage/value
    features.push({
        name: 'Discount',
        brandAValue: dealA.discountLabel,
        brandBValue: dealB.discountLabel,
        winner: determineDiscountWinner(dealA, dealB),
    });

    // Student price
    if (dealA.studentPrice || dealB.studentPrice) {
        features.push({
            name: 'Student Price',
            brandAValue: dealA.studentPrice ? `$${dealA.studentPrice}` : 'N/A',
            brandBValue: dealB.studentPrice ? `$${dealB.studentPrice}` : 'N/A',
            winner: determinePriceWinner(dealA.studentPrice, dealB.studentPrice),
        });
    }

    // Original price
    if (dealA.originalPrice || dealB.originalPrice) {
        features.push({
            name: 'Regular Price',
            brandAValue: dealA.originalPrice ? `$${dealA.originalPrice}` : 'N/A',
            brandBValue: dealB.originalPrice ? `$${dealB.originalPrice}` : 'N/A',
            winner: 'tie',
        });
    }

    // Verification method
    features.push({
        name: 'Verification',
        brandAValue: formatVerificationMethod(dealA.verificationMethod),
        brandBValue: formatVerificationMethod(dealB.verificationMethod),
        winner: determineVerificationWinner(dealA.verificationMethod, dealB.verificationMethod),
    });

    // New customer only (optional field - may not be present in API response)
    const isNewCustomerOnlyA = (dealA as any).isNewCustomerOnly ?? false;
    const isNewCustomerOnlyB = (dealB as any).isNewCustomerOnly ?? false;
    features.push({
        name: 'New Customers Only?',
        brandAValue: isNewCustomerOnlyA ? 'Yes' : 'No',
        brandBValue: isNewCustomerOnlyB ? 'Yes' : 'No',
        winner: isNewCustomerOnlyA ? (isNewCustomerOnlyB ? 'tie' : 'brandB') : (isNewCustomerOnlyB ? 'brandA' : 'tie'),
    });

    // Calculate overall winner
    let brandAScore = 0;
    let brandBScore = 0;
    for (const feature of features) {
        if (feature.winner === 'brandA') brandAScore++;
        if (feature.winner === 'brandB') brandBScore++;
    }

    const overallWinner: 'brandA' | 'brandB' | 'tie' = 
        brandAScore > brandBScore ? 'brandA' : 
        brandBScore > brandAScore ? 'brandB' : 'tie';

    return {
        brandA: { name: brandA.name, slug: brandA.slug },
        brandB: { name: brandB.name, slug: brandB.slug },
        features,
        overallWinner,
    };
}

/**
 * Generates use case recommendations
 */
export function generateUseCaseRecommendations(params: {
    brandAName: string;
    brandBName: string;
    matrix: ComparisonMatrix;
}): UseCaseRecommendation[] {
    const { brandAName, brandBName, matrix } = params;
    const recommendations: UseCaseRecommendation[] = [];

    // Brand A scenarios
    const brandAScenarios: string[] = [];
    if (matrix.overallWinner === 'brandA') {
        brandAScenarios.push(`You want the overall better value`);
    }
    
    const discountFeature = matrix.features.find(f => f.name === 'Discount');
    if (discountFeature?.winner === 'brandA') {
        brandAScenarios.push(`You want the deeper discount (${discountFeature.brandAValue})`);
    }
    
    const priceFeature = matrix.features.find(f => f.name === 'Student Price');
    if (priceFeature?.winner === 'brandA') {
        brandAScenarios.push(`You want the lowest monthly cost`);
    }
    
    const verifyFeature = matrix.features.find(f => f.name === 'Verification');
    if (verifyFeature?.winner === 'brandA') {
        brandAScenarios.push(`You prefer ${verifyFeature.brandAValue} verification (faster/easier)`);
    }

    const newCustFeature = matrix.features.find(f => f.name === 'New Customers Only?');
    if (newCustFeature?.brandAValue === 'No') {
        brandAScenarios.push(`You're an existing customer`);
    }

    if (brandAScenarios.length === 0) {
        brandAScenarios.push(`You prefer ${brandAName}'s products and ecosystem`);
    }

    recommendations.push({ brand: 'A', scenarios: brandAScenarios });

    // Brand B scenarios
    const brandBScenarios: string[] = [];
    if (matrix.overallWinner === 'brandB') {
        brandBScenarios.push(`You want the overall better value`);
    }
    
    if (discountFeature?.winner === 'brandB') {
        brandBScenarios.push(`You want the deeper discount (${discountFeature.brandBValue})`);
    }
    
    if (priceFeature?.winner === 'brandB') {
        brandBScenarios.push(`You want the lowest monthly cost`);
    }
    
    if (verifyFeature?.winner === 'brandB') {
        brandBScenarios.push(`You prefer ${verifyFeature.brandBValue} verification`);
    }
    
    if (newCustFeature?.brandBValue === 'No') {
        brandBScenarios.push(`You're an existing customer`);
    }

    if (brandBScenarios.length === 0) {
        brandBScenarios.push(`You prefer ${brandBName}'s products and ecosystem`);
    }

    recommendations.push({ brand: 'B', scenarios: brandBScenarios });

    return recommendations;
}

/**
 * Generates a verdict summary
 */
export function generateVerdict(params: {
    brandAName: string;
    brandBName: string;
    matrix: ComparisonMatrix;
}): string {
    const { brandAName, brandBName, matrix } = params;

    const winner = matrix.overallWinner;
    const winnerName = winner === 'brandA' ? brandAName : winner === 'brandB' ? brandBName : null;

    if (winner === 'tie') {
        return `Both ${brandAName} and ${brandBName} offer competitive student discounts. Your choice should come down to brand preference, existing subscriptions, and which verification method works best for you.`;
    }

    const discountFeature = matrix.features.find(f => f.name === 'Discount');
    const discountAdvantage = discountFeature && discountFeature.winner === winner ? 
        ` with a better discount (${winner === 'brandA' ? discountFeature.brandAValue : discountFeature.brandBValue})` : '';

    return `${winnerName} edges ahead${discountAdvantage}, but both brands offer solid student savings. Consider your existing subscriptions and brand preferences when making your choice.`;
}

// Helper functions

function determineDiscountWinner(dealA: any, dealB: any): 'brandA' | 'brandB' | 'tie' {
    const scoreA = calculateDiscountScore(dealA);
    const scoreB = calculateDiscountScore(dealB);
    
    if (scoreA > scoreB) return 'brandA';
    if (scoreB > scoreA) return 'brandB';
    return 'tie';
}

function calculateDiscountScore(deal: any): number {
    if (deal.discountType === 'free') return 100;
    if (deal.discountType === 'trial') return 80;
    if (deal.discountValue) return deal.discountValue;
    return 0;
}

function determinePriceWinner(priceA?: number | null, priceB?: number | null): 'brandA' | 'brandB' | 'tie' {
    if (!priceA && !priceB) return 'tie';
    if (!priceA) return 'brandB';
    if (!priceB) return 'brandA';
    if (priceA < priceB) return 'brandA';
    if (priceB < priceA) return 'brandB';
    return 'tie';
}

function determineVerificationWinner(methodA: string, methodB: string): 'brandA' | 'brandB' | 'tie' {
    // Prefer email verification as easiest
    const scoreA = getVerificationScore(methodA);
    const scoreB = getVerificationScore(methodB);
    
    if (scoreA > scoreB) return 'brandA';
    if (scoreB > scoreA) return 'brandB';
    return 'tie';
}

function getVerificationScore(method: string): number {
    const scores: Record<string, number> = {
        'edu_email': 100,
        'unidays': 80,
        'student_beans': 80,
        'sheerid': 70,
    };
    return scores[method.toLowerCase()] || 50;
}

function formatVerificationMethod(method: string): string {
    const names: Record<string, string> = {
        'edu_email': '.edu Email',
        'unidays': 'UNiDAYS',
        'student_beans': 'Student Beans',
        'sheerid': 'SheerID',
    };
    return names[method.toLowerCase()] || method;
}
