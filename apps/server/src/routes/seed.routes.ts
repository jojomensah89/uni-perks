import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, categories, deals, brands, tags, regions, dealRegions, dealTags, eq, and } from "@uni-perks/db";

const app = new OpenAPIHono();

// =============================================
// SEED DATA - Expanded for comprehensive demo
// =============================================

const SEED_REGIONS = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'GLOBAL', name: 'Global' },
];

const SEED_CATEGORIES = [
    { name: 'Tech & Software', slug: 'tech-software', icon: 'laptop', color: '#3B82F6' },
    { name: 'Streaming & Entertainment', slug: 'streaming', icon: 'play-circle', color: '#EF4444' },
    { name: 'Food & Delivery', slug: 'food-delivery', icon: 'utensils', color: '#F59E0B' },
    { name: 'Fashion & Lifestyle', slug: 'fashion', icon: 'shopping-bag', color: '#EC4899' },
    { name: 'Travel & Transport', slug: 'travel', icon: 'plane', color: '#10B981' },
    { name: 'Education & Learning', slug: 'education', icon: 'graduation-cap', color: '#8B5CF6' },
    { name: 'Health & Wellness', slug: 'health-wellness', icon: 'heart', color: '#14B8A6' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: 'dumbbell', color: '#F97316' },
];

const SEED_TAGS = [
    { slug: 'developer-tools', name: 'Developer Tools', audience: 'cs-students' },
    { slug: 'design-tools', name: 'Design Tools', audience: 'designers' },
    { slug: 'productivity', name: 'Productivity', audience: 'all' },
    { slug: 'streaming', name: 'Streaming', audience: 'all' },
    { slug: 'music', name: 'Music', audience: 'all' },
    { slug: 'cloud-storage', name: 'Cloud Storage', audience: 'all' },
    { slug: 'fashion', name: 'Fashion', audience: 'all' },
    { slug: 'fitness', name: 'Fitness', audience: 'all' },
    { slug: 'food', name: 'Food', audience: 'all' },
    { slug: 'travel', name: 'Travel', audience: 'all' },
];

const SEED_BRANDS = [
    // Tech & Software
    {
        slug: 'github',
        name: 'GitHub',
        tagline: 'Where the world builds software',
        whyWeLoveIt: "GitHub's Student Developer pack is unmatched - free access to Pro, Copilot, and 100+ developer tools worth $200k+.",
        website: 'https://github.com',
        isVerified: true,
    },
    {
        slug: 'notion',
        name: 'Notion',
        tagline: 'All-in-one workspace',
        whyWeLoveIt: "The ultimate productivity tool for students. Free Personal Pro plan includes unlimited blocks and file uploads.",
        website: 'https://notion.so',
        isVerified: true,
    },
    {
        slug: 'figma',
        name: 'Figma',
        tagline: 'Design together',
        whyWeLoveIt: "Industry-standard design tool with a generous free tier for students. Perfect for design majors and side projects.",
        website: 'https://figma.com',
        isVerified: true,
    },
    {
        slug: 'jetbrains',
        name: 'JetBrains',
        tagline: 'Professional developer tools',
        whyWeLoveIt: "Get free access to all JetBrains IDEs - IntelliJ IDEA, PyCharm, WebStorm, and more. Essential for CS students.",
        website: 'https://jetbrains.com',
        isVerified: true,
    },
    {
        slug: 'digitalocean',
        name: 'DigitalOcean',
        tagline: 'Simple cloud computing',
        whyWeLoveIt: "$200 in free credits for students via GitHub pack. Perfect for deploying projects and learning server management.",
        website: 'https://digitalocean.com',
        isVerified: true,
    },
    // Streaming & Entertainment
    {
        slug: 'spotify',
        name: 'Spotify',
        tagline: 'Music for everyone',
        whyWeLoveIt: "Premium + Hulu bundle for $5.99/month. The best study playlist companion with ad-free listening.",
        website: 'https://spotify.com',
        isVerified: true,
    },
    {
        slug: 'apple',
        name: 'Apple',
        tagline: 'Think different',
        whyWeLoveIt: "Education pricing on Mac and iPad, plus 50% off Apple Music with Apple TV+ included.",
        website: 'https://apple.com',
        isVerified: true,
    },
    // Food & Delivery
    {
        slug: 'uber-eats',
        name: 'Uber Eats',
        tagline: 'Food delivery',
        whyWeLoveIt: "Student discounts on delivery fees and exclusive promos. Late night study sessions just got easier.",
        website: 'https://ubereats.com',
        isVerified: true,
    },
    {
        slug: 'doordash',
        name: 'DoorDash',
        tagline: 'Restaurant delivery',
        whyWeLoveIt: "DashPass student discount with reduced delivery fees. Perfect for those all-nighters.",
        website: 'https://doordash.com',
        isVerified: true,
    },
    // Fashion & Lifestyle
    {
        slug: 'nike',
        name: 'Nike',
        tagline: 'Just Do It',
        whyWeLoveIt: "Up to 40% off for verified students. Premium athletic wear at student-friendly prices.",
        website: 'https://nike.com',
        isVerified: true,
    },
    {
        slug: 'asos',
        name: 'ASOS',
        tagline: 'Fashion destination',
        whyWeLoveIt: "10% off everything for students, plus exclusive flash sales. Your one-stop shop for trendy fashion.",
        website: 'https://asos.com',
        isVerified: true,
    },
    {
        slug: 'adidas',
        name: 'Adidas',
        tagline: 'Impossible is Nothing',
        whyWeLoveIt: "30% off online orders for students. Premium sportswear at a significant discount.",
        website: 'https://adidas.com',
        isVerified: true,
    },
    // Travel & Transport
    {
        slug: 'student-universe',
        name: 'StudentUniverse',
        tagline: 'Student travel deals',
        whyWeLoveIt: "Exclusive flight and hotel discounts for students. Travel the world on a student budget.",
        website: 'https://studentuniverse.com',
        isVerified: true,
    },
    // Education & Learning
    {
        slug: 'coursera',
        name: 'Coursera',
        tagline: 'Learn from the best',
        whyWeLoveIt: "Free access to thousands of courses through university partnerships. Level up your skills for free.",
        website: 'https://coursera.org',
        isVerified: true,
    },
    {
        slug: 'skillshare',
        name: 'Skillshare',
        tagline: 'Online classes',
        whyWeLoveIt: "Free Premium membership for students. Learn creative skills from industry professionals.",
        website: 'https://skillshare.com',
        isVerified: true,
    },
    // Health & Wellness
    {
        slug: 'headspace',
        name: 'Headspace',
        tagline: 'Meditation & mindfulness',
        whyWeLoveIt: "Free access for students through many universities. Mental health support during stressful times.",
        website: 'https://headspace.com',
        isVerified: true,
    },
    // Sports & Outdoors
    {
        slug: 'gymshark',
        name: 'Gymshark',
        tagline: 'Fitness apparel',
        whyWeLoveIt: "15% student discount on premium gym wear. Look good while working on that freshman 15 (or avoiding it).",
        website: 'https://gymshark.com',
        isVerified: true,
    },
    // Additional
    {
        slug: 'amazon',
        name: 'Amazon',
        tagline: 'Everything store',
        whyWeLoveIt: "6 months free Prime Student, then 50% off. Free shipping, Prime Video, and exclusive deals.",
        website: 'https://amazon.com',
        isVerified: true,
    },
    {
        slug: 'adobe',
        name: 'Adobe',
        tagline: 'Creativity for all',
        whyWeLoveIt: "60% off Creative Cloud All Apps. The industry standard for creative work at a student price.",
        website: 'https://adobe.com',
        isVerified: true,
    },
    {
        slug: 'microsoft',
        name: 'Microsoft',
        tagline: 'Empower every person',
        whyWeLoveIt: "Free Office 365 for students, plus 10% off Surface devices. Essential productivity tools at no cost.",
        website: 'https://microsoft.com',
        isVerified: true,
    },
];

// Comprehensive deals with accurate real-world data
const SEED_DEALS = [
    // === TECH & SOFTWARE ===
    {
        slug: 'github-student-developer-pack',
        brandSlug: 'github',
        categorySlug: 'tech-software',
        title: 'GitHub Student Developer Pack',
        shortDescription: 'Free access to 100+ developer tools',
        longDescription: 'Get free access to GitHub Pro, Copilot, and over 100 developer tools and services worth over $200,000. Includes cloud credits, domain names, IDEs, and more.',
        discountType: 'free',
        discountLabel: 'FREE ACCESS',
        verificationMethod: 'edu_email',
        claimUrl: 'https://education.github.com/pack',
        isNewCustomerOnly: false,
        conditions: [
            "Must be a student 13+ enrolled in a degree-granting institution",
            "Free for the duration of your studies",
            "Includes GitHub Pro, Copilot, Codespaces, and 100+ partner offers"
        ],
        howToRedeem: "Visit education.github.com, sign up with your school email, and verify your student status.",
        isFeatured: true,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['developer-tools', 'productivity'],
    },
    {
        slug: 'notion-free-student',
        brandSlug: 'notion',
        categorySlug: 'tech-software',
        title: 'Notion Free Student Plan',
        shortDescription: 'Personal Pro plan free for students',
        longDescription: 'Get Notion Personal Pro completely free as a student. Includes unlimited blocks, unlimited file uploads, and all pro features.',
        discountType: 'free',
        discountLabel: 'FREE PRO PLAN',
        verificationMethod: 'edu_email',
        claimUrl: 'https://notion.so/students',
        isNewCustomerOnly: false,
        conditions: [
            "Valid .edu email required",
            "Free while you're a student",
            "Unlimited blocks and file uploads included"
        ],
        howToRedeem: "Sign up with your university email at notion.so/students.",
        isFeatured: true,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['productivity'],
    },
    {
        slug: 'jetbrains-ide-student-license',
        brandSlug: 'jetbrains',
        categorySlug: 'tech-software',
        title: 'JetBrains Student License',
        shortDescription: 'Free access to all JetBrains IDEs',
        longDescription: 'Get free access to all JetBrains IDEs including IntelliJ IDEA, PyCharm, WebStorm, PhpStorm, and more. The professional tools used by developers worldwide.',
        discountType: 'free',
        discountLabel: 'FREE LICENSE',
        verificationMethod: 'edu_email',
        claimUrl: 'https://jetbrains.com/student',
        isNewCustomerOnly: false,
        conditions: [
            "Must be enrolled in an accredited educational institution",
            "License valid for 1 year, renewable while studying",
            "Includes all IntelliJ-based IDEs and .NET tools"
        ],
        howToRedeem: "Apply at jetbrains.com/student with your university email. Approval typically takes 1-2 days.",
        isFeatured: false,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['developer-tools'],
    },
    {
        slug: 'figma-education-plan',
        brandSlug: 'figma',
        categorySlug: 'tech-software',
        title: 'Figma Education Plan',
        shortDescription: 'Free Professional plan for students',
        longDescription: 'Get Figma Professional plan free as a student. Includes unlimited collaborators, projects, and version history.',
        discountType: 'free',
        discountLabel: 'FREE PRO',
        verificationMethod: 'edu_email',
        claimUrl: 'https://figma.com/education',
        isNewCustomerOnly: false,
        conditions: [
            "Valid school email required",
            "Free while enrolled as a student",
            "Includes FigJam whiteboard access"
        ],
        howToRedeem: "Sign up at figma.com/education with your .edu email.",
        isFeatured: false,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['design-tools'],
    },
    {
        slug: 'digitalocean-student-credits',
        brandSlug: 'digitalocean',
        categorySlug: 'tech-software',
        title: 'DigitalOcean Student Credits',
        shortDescription: '$200 free cloud credits',
        longDescription: 'Get $200 in DigitalOcean credits for cloud hosting through the GitHub Student Developer Pack. Perfect for deploying projects.',
        discountType: 'fixed',
        discountLabel: '$200 FREE',
        verificationMethod: 'edu_email',
        claimUrl: 'https://education.github.com/pack',
        isNewCustomerOnly: true,
        conditions: [
            "Available through GitHub Student Developer Pack",
            "$200 in credits for 1 year",
            "Includes Droplets, Spaces, and managed databases"
        ],
        howToRedeem: "Claim through your GitHub Student Developer Pack dashboard.",
        isFeatured: false,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['developer-tools', 'cloud-storage'],
    },
    // === STREAMING & ENTERTAINMENT ===
    {
        slug: 'spotify-premium-student',
        brandSlug: 'spotify',
        categorySlug: 'streaming',
        title: 'Spotify Premium Student',
        shortDescription: 'Premium + Hulu for $5.99/mo',
        longDescription: 'Get Spotify Premium with Hulu (ad-supported) for just $5.99/month. Ad-free music, offline downloads, and on-demand TV.',
        discountType: 'percentage',
        discountValue: 50,
        discountLabel: '50% OFF',
        originalPrice: 10.99,
        studentPrice: 5.99,
        currency: 'USD',
        verificationMethod: 'sheerid',
        claimUrl: 'https://spotify.com/student',
        isNewCustomerOnly: true,
        conditions: [
            "SheerID verification required",
            "Hulu bundle available in US only",
            "Renew student status every 12 months",
            "Up to 4 years of discounted pricing"
        ],
        howToRedeem: "Sign up at spotify.com/student and verify through SheerID.",
        isFeatured: true,
        isActive: true,
        regions: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
        tags: ['streaming', 'music'],
    },
    {
        slug: 'apple-music-student',
        brandSlug: 'apple',
        categorySlug: 'streaming',
        title: 'Apple Music Student',
        shortDescription: '50% off with Apple TV+',
        longDescription: 'Get Apple Music for $5.99/month with Apple TV+ included. 100 million songs, ad-free, with exclusive shows.',
        discountType: 'percentage',
        discountValue: 50,
        discountLabel: '50% OFF',
        originalPrice: 10.99,
        studentPrice: 5.99,
        currency: 'USD',
        verificationMethod: 'unidays',
        claimUrl: 'https://apple.com/apple-music/student',
        isNewCustomerOnly: false,
        conditions: [
            "UNiDAYS verification required",
            "Apple TV+ included at no extra cost",
            "Valid for up to 4 years"
        ],
        howToRedeem: "Subscribe via the Music app and verify with UNiDAYS.",
        isFeatured: false,
        isActive: true,
        regions: ['US', 'GB', 'CA', 'AU'],
        tags: ['streaming', 'music'],
    },
    {
        slug: 'amazon-prime-student',
        brandSlug: 'amazon',
        categorySlug: 'streaming',
        title: 'Amazon Prime Student',
        shortDescription: '6 months free, then 50% off',
        longDescription: 'Start with a 6-month free trial, then get Prime for just $7.49/month. Includes free 2-day shipping, Prime Video, Music, and more.',
        discountType: 'trial',
        discountLabel: '6 MONTHS FREE',
        originalPrice: 14.99,
        studentPrice: 7.49,
        currency: 'USD',
        verificationMethod: 'edu_email',
        claimUrl: 'https://amazon.com/amazonprime',
        isNewCustomerOnly: true,
        conditions: [
            "Valid .edu email required",
            "6-month free trial, then $7.49/month",
            "Includes Prime Video, Music, and free shipping",
            "Cancel anytime"
        ],
        howToRedeem: "Sign up at amazon.com/prime with your .edu email.",
        isFeatured: true,
        isActive: true,
        regions: ['US'],
        tags: ['streaming', 'productivity'],
    },
    // === FOOD & DELIVERY ===
    {
        slug: 'uber-eats-student-discount',
        brandSlug: 'uber-eats',
        categorySlug: 'food-delivery',
        title: 'Uber Eats Student Discount',
        shortDescription: 'Reduced delivery fees',
        longDescription: 'Students get $0 delivery fees on eligible orders plus exclusive promotions and discounts.',
        discountType: 'percentage',
        discountLabel: 'FREE DELIVERY',
        verificationMethod: 'unidays',
        claimUrl: 'https://ubereats.com',
        isNewCustomerOnly: false,
        conditions: [
            "UNiDAYS verification required",
            "Valid on orders over $20",
            "Available in select cities"
        ],
        howToRedeem: "Link your UNiDAYS account in the Uber Eats app.",
        isFeatured: false,
        isActive: true,
        regions: ['US', 'GB', 'CA', 'AU'],
        tags: ['food'],
    },
    {
        slug: 'doordash-student-discount',
        brandSlug: 'doordash',
        categorySlug: 'food-delivery',
        title: 'DoorDash Student Discount',
        shortDescription: 'DashPass for students',
        longDescription: 'Get DashPass student pricing at $4.99/month instead of $9.99. Free delivery on orders over $12.',
        discountType: 'percentage',
        discountValue: 50,
        discountLabel: '50% OFF',
        originalPrice: 9.99,
        studentPrice: 4.99,
        currency: 'USD',
        verificationMethod: 'sheerid',
        claimUrl: 'https://doordash.com',
        isNewCustomerOnly: false,
        conditions: [
            "SheerID verification required",
            "$0 delivery on orders $12+",
            "Reduced service fees"
        ],
        howToRedeem: "Sign up for DashPass and verify your student status.",
        isFeatured: false,
        isActive: true,
        regions: ['US', 'CA', 'AU'],
        tags: ['food'],
    },
    // === FASHION & LIFESTYLE ===
    {
        slug: 'nike-student-discount',
        brandSlug: 'nike',
        categorySlug: 'fashion',
        title: 'Nike Student Discount',
        shortDescription: 'Up to 40% off sitewide',
        longDescription: 'Verified students get up to 40% off on Nike.com. Premium athletic footwear and apparel at student prices.',
        discountType: 'percentage',
        discountValue: 40,
        discountLabel: 'UP TO 40% OFF',
        verificationMethod: 'sheerid',
        claimUrl: 'https://nike.com/student',
        isNewCustomerOnly: false,
        conditions: [
            "SheerID verification required",
            "Valid on most items",
            "Cannot combine with other offers"
        ],
        howToRedeem: "Verify your student status at nike.com/student to receive your unique discount code.",
        isFeatured: true,
        isActive: true,
        regions: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'],
        tags: ['fashion'],
    },
    {
        slug: 'asos-student-discount',
        brandSlug: 'asos',
        categorySlug: 'fashion',
        title: 'ASOS Student Discount',
        shortDescription: '10% off everything',
        longDescription: 'Get 10% off everything at ASOS, plus exclusive flash sales and early access to new drops.',
        discountType: 'percentage',
        discountValue: 10,
        discountLabel: '10% OFF',
        verificationMethod: 'unidays',
        claimUrl: 'https://asos.com/discount/student',
        isNewCustomerOnly: false,
        conditions: [
            "UNiDAYS verification required",
            "Valid on all full-price items",
            "Stackable with sale items"
        ],
        howToRedeem: "Link your UNiDAYS account for automatic discounts.",
        isFeatured: false,
        isActive: true,
        regions: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'],
        tags: ['fashion'],
    },
    {
        slug: 'adidas-student-discount',
        brandSlug: 'adidas',
        categorySlug: 'fashion',
        title: 'Adidas Student Discount',
        shortDescription: '30% off online orders',
        longDescription: 'Students get 30% off at adidas.com. Premium sportswear and sneakers at a major discount.',
        discountType: 'percentage',
        discountValue: 30,
        discountLabel: '30% OFF',
        verificationMethod: 'sheerid',
        claimUrl: 'https://adidas.com/us/students',
        isNewCustomerOnly: false,
        conditions: [
            "SheerID verification required",
            "Valid on most items online",
            "Some exclusions apply"
        ],
        howToRedeem: "Verify at adidas.com/students to get your promo code.",
        isFeatured: false,
        isActive: true,
        regions: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'],
        tags: ['fashion', 'fitness'],
    },
    // === TRAVEL & TRANSPORT ===
    {
        slug: 'student-universe-flights',
        brandSlug: 'student-universe',
        categorySlug: 'travel',
        title: 'StudentUniverse Flight Deals',
        shortDescription: 'Exclusive student fares',
        longDescription: 'Access exclusive student-only flight deals and discounts. Flexible change policies and best price guarantee.',
        discountType: 'percentage',
        discountLabel: 'EXCLUSIVE DEALS',
        verificationMethod: 'edu_email',
        claimUrl: 'https://studentuniverse.com',
        isNewCustomerOnly: false,
        conditions: [
            "Valid school email required",
            "Flexible date options available",
            "Best price guarantee"
        ],
        howToRedeem: "Sign up with your .edu email to access member-exclusive fares.",
        isFeatured: false,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['travel'],
    },
    // === EDUCATION & LEARNING ===
    {
        slug: 'coursera-for-students',
        brandSlug: 'coursera',
        categorySlug: 'education',
        title: 'Coursera for Campus',
        shortDescription: 'Free access via university',
        longDescription: 'Many universities partner with Coursera to provide free access to thousands of courses and certificates.',
        discountType: 'free',
        discountLabel: 'FREE ACCESS',
        verificationMethod: 'edu_email',
        claimUrl: 'https://coursera.org',
        isNewCustomerOnly: false,
        conditions: [
            "Check if your university is partnered",
            "Access to guided projects and courses",
            "Certificates included"
        ],
        howToRedeem: "Log in with your university credentials to see if your school participates.",
        isFeatured: false,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['productivity'],
    },
    {
        slug: 'skillshare-student-free',
        brandSlug: 'skillshare',
        categorySlug: 'education',
        title: 'Skillshare Free Student Premium',
        shortDescription: 'Free Premium membership',
        longDescription: 'Get Skillshare Premium free through the GitHub Student Developer Pack. Unlimited access to all classes.',
        discountType: 'free',
        discountLabel: 'FREE PREMIUM',
        verificationMethod: 'edu_email',
        claimUrl: 'https://education.github.com/pack',
        isNewCustomerOnly: true,
        conditions: [
            "Available through GitHub Student Pack",
            "6 months free Premium",
            "Access to 30,000+ classes"
        ],
        howToRedeem: "Claim through your GitHub Student Developer Pack.",
        isFeatured: false,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['design-tools', 'productivity'],
    },
    // === HEALTH & WELLNESS ===
    {
        slug: 'headspace-student-free',
        brandSlug: 'headspace',
        categorySlug: 'health-wellness',
        title: 'Headspace for Students',
        shortDescription: 'Free for university students',
        longDescription: 'Many universities provide free Headspace access to students. Meditation, sleep sounds, and mental health support.',
        discountType: 'free',
        discountLabel: 'FREE ACCESS',
        verificationMethod: 'edu_email',
        claimUrl: 'https://headspace.com/student',
        isNewCustomerOnly: false,
        conditions: [
            "Check if your university partners with Headspace",
            "Full library of meditations",
            "Sleep and focus content included"
        ],
        howToRedeem: "Visit headspace.com/student to check if your school provides free access.",
        isFeatured: false,
        isActive: true,
        regions: ['US', 'GB', 'CA', 'AU'],
        tags: ['productivity'],
    },
    // === SPORTS & OUTDOORS ===
    {
        slug: 'gymshark-student-discount',
        brandSlug: 'gymshark',
        categorySlug: 'sports-outdoors',
        title: 'Gymshark Student Discount',
        shortDescription: '15% off fitness apparel',
        longDescription: 'Students get 15% off all Gymshark fitness apparel. Premium gym wear at student-friendly prices.',
        discountType: 'percentage',
        discountValue: 15,
        discountLabel: '15% OFF',
        verificationMethod: 'sheerid',
        claimUrl: 'https://gymshark.com/pages/student-discount',
        isNewCustomerOnly: false,
        conditions: [
            "SheerID verification required",
            "Valid on all items",
            "Cannot stack with other codes"
        ],
        howToRedeem: "Verify at gymshark.com/student for your unique discount code.",
        isFeatured: false,
        isActive: true,
        regions: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'],
        tags: ['fashion', 'fitness'],
    },
    // === ADDITIONAL ===
    {
        slug: 'adobe-creative-cloud-student',
        brandSlug: 'adobe',
        categorySlug: 'tech-software',
        title: 'Adobe Creative Cloud Student',
        shortDescription: '60% off All Apps plan',
        longDescription: 'Get 60% off Creative Cloud All Apps - Photoshop, Illustrator, Premiere Pro, and 20+ creative tools.',
        discountType: 'percentage',
        discountValue: 60,
        discountLabel: '60% OFF',
        originalPrice: 54.99,
        studentPrice: 19.99,
        currency: 'USD',
        verificationMethod: 'sheerid',
        claimUrl: 'https://adobe.com/creativecloud/buy/students.html',
        isNewCustomerOnly: false,
        conditions: [
            "SheerID verification required",
            "First year at student price",
            "Annual commitment required"
        ],
        howToRedeem: "Visit adobe.com/students and verify your enrollment.",
        isFeatured: true,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['design-tools', 'productivity'],
    },
    {
        slug: 'microsoft-office-365-student',
        brandSlug: 'microsoft',
        categorySlug: 'tech-software',
        title: 'Microsoft 365 Education',
        shortDescription: 'Free Office for students',
        longDescription: 'Get Microsoft 365 (Word, Excel, PowerPoint, Teams) completely free with your valid school email address.',
        discountType: 'free',
        discountLabel: 'FREE OFFICE',
        verificationMethod: 'edu_email',
        claimUrl: 'https://microsoft.com/education',
        isNewCustomerOnly: false,
        conditions: [
            "Valid school email required",
            "Includes Word, Excel, PowerPoint, Teams",
            "1TB OneDrive storage included"
        ],
        howToRedeem: "Sign up at microsoft.com/education with your school email.",
        isFeatured: true,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['productivity'],
    },
];

const seedRoute = createRoute({
    method: "post",
    path: "/",
    tags: ["Seed"],
    summary: "Seed Database",
    description: "Seed the database with initial categories and deals.",
    responses: {
        200: {
            description: "Seed successful",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        message: z.string(),
                    }),
                },
            },
        },
        500: {
            description: "Seed failed",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        error: z.string(),
                    }),
                },
            },
        }
    },
});

app.openapi(seedRoute, async (c) => {
    try {
        console.log('🌱 Seeding database via API...');

        // 1. Regions
        console.log('Inserting regions...');
        const insertedRegions: Record<string, string> = {};
        for (const region of SEED_REGIONS) {
            const existing = await db.select().from(regions).where(eq(regions.code, region.code)).limit(1);
            if (existing.length > 0 && existing[0]) {
                insertedRegions[region.code] = existing[0].id;
            } else {
                const res = await db.insert(regions).values(region).returning();
                if (res[0]) {
                    insertedRegions[region.code] = res[0].id;
                }
            }
        }

        // 2. Categories
        console.log('Inserting categories...');
        const insertedCategories: Record<string, string> = {};
        for (const cat of SEED_CATEGORIES) {
            const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug)).limit(1);
            if (existing.length > 0 && existing[0]) {
                insertedCategories[cat.slug] = existing[0].id;
            } else {
                const res = await db.insert(categories).values(cat).returning();
                if (res[0]) {
                    insertedCategories[cat.slug] = res[0].id;
                }
            }
        }

        // 3. Tags
        console.log('Inserting tags...');
        const insertedTags: Record<string, string> = {};
        for (const tag of SEED_TAGS) {
            const existing = await db.select().from(tags).where(eq(tags.slug, tag.slug)).limit(1);
            if (existing.length > 0 && existing[0]) {
                insertedTags[tag.slug] = existing[0].id;
            } else {
                const res = await db.insert(tags).values(tag).returning();
                if (res[0]) {
                    insertedTags[tag.slug] = res[0].id;
                }
            }
        }

        // 4. Brands
        console.log('Inserting brands...');
        const insertedBrands: Record<string, string> = {};
        for (const brand of SEED_BRANDS) {
            const existing = await db.select().from(brands).where(eq(brands.slug, brand.slug)).limit(1);
            if (existing.length > 0 && existing[0]) {
                insertedBrands[brand.slug] = existing[0].id;
            } else {
                const res = await db.insert(brands).values(brand).returning();
                if (res[0]) {
                    insertedBrands[brand.slug] = res[0].id;
                }
            }
        }

        // 5. Deals with region and tag mappings
        console.log('Inserting deals...');
        let insertedDeals = 0;
        for (const deal of SEED_DEALS) {
            const existing = await db.select().from(deals).where(eq(deals.slug, deal.slug)).limit(1);
            if (existing.length > 0 && existing[0]) {
                continue; // Skip if exists
            }

            const brandId = insertedBrands[deal.brandSlug];
            const categoryId = insertedCategories[deal.categorySlug];
            if (!brandId || !categoryId) {
                console.warn(`Missing brand or category for deal: ${deal.title}`);
                continue;
            }

            const { regions: dealRegionCodes, tags: dealTagSlugs, conditions, ...dealData } = deal;

            const insertData = {
                ...dealData,
                brandId,
                categoryId,
                conditions: conditions ? JSON.stringify(conditions) : null,
            };

            const res = await db.insert(deals).values(insertData).returning();
            if (!res[0]) continue;
            const dealId = res[0].id;
            insertedDeals++;

            // Link regions
            for (const regionCode of dealRegionCodes) {
                const regionId = insertedRegions[regionCode];
                if (regionId) {
                    try {
                        await db.insert(dealRegions).values({ dealId, regionId });
                    } catch {
                        // Ignore duplicates
                    }
                }
            }

            // Link tags
            for (const tagSlug of dealTagSlugs) {
                const tagId = insertedTags[tagSlug];
                if (tagId) {
                    try {
                        await db.insert(dealTags).values({ dealId, tagId });
                    } catch {
                        // Ignore duplicates
                    }
                }
            }
        }

        console.log(`✅ Seeded ${insertedDeals} deals.`);

        // 6. Seed a Featured Collection
        const { collections, collectionDeals } = await import("@uni-perks/db");
        const collectionSlug = "student-essentials";
        const existingCollection = await db.select().from(collections).where(eq(collections.slug, collectionSlug)).limit(1);

        let collectionId = existingCollection[0]?.id;

        if (!collectionId) {
            const newCollection = await db.insert(collections).values({
                name: "Student Essentials",
                slug: collectionSlug,
                description: "Must-have tools and resources for every student.",
                audience: "All Students",
                isFeatured: true,
                displayOrder: 1
            }).returning();
            if (newCollection[0]) collectionId = newCollection[0].id;
        }

        if (collectionId) {
            const allSeededDeals = await db.select().from(deals).limit(3);
            for (let i = 0; i < allSeededDeals.length; i++) {
                const deal = allSeededDeals[i];
                if (!deal) continue;

                const existingMap = await db.select().from(collectionDeals)
                    .where(and(eq(collectionDeals.collectionId, collectionId), eq(collectionDeals.dealId, deal.id)))
                    .limit(1);

                if (existingMap.length === 0) {
                    await db.insert(collectionDeals).values({
                        collectionId,
                        dealId: deal.id,
                        displayOrder: i
                    });
                }
            }
            console.log(`✅ Seeded Collection: Student Essentials`);
        }

        return c.json({ success: true, message: `Seeded ${Object.keys(insertedRegions).length} regions, ${Object.keys(insertedCategories).length} categories, ${Object.keys(insertedTags).length} tags, ${Object.keys(insertedBrands).length} brands, ${insertedDeals} deals, and 1 collection.` }, 200);
    } catch (e) {
        console.error(e);
        return c.json({ success: false, error: String(e) }, 500);
    }
});

export default app;
