export interface DealData {
    id: string;
    tags: string[];
    brand: string;
    subtitle: string;
    discount: string;
    detail: string;
    cta: string;
    bg: string;
    image: string;
    logoSvg: string;
    category: string;
    verificationMethod?: string;
    estimatedValue?: string;
    featured?: boolean;
    regions?: { region: string; available: boolean; note?: string }[];
    terms?: string[];
    guidelines?: string[];
    minimumSpend?: number;
    howToRedeem?: string;
    termsUrl?: string;
    conditions?: string[];
}

export const allDeals: DealData[] = [
    // ─── ENTERTAINMENT ───────────────────────────────────────────────
    {
        id: "spotify",
        tags: ["Music", "Streaming"],
        brand: "Spotify",
        subtitle: "Student Premium",
        discount: "50% off",
        detail: "Ad-free music streaming, offline listening, and unlimited skips. Includes Hulu (with ads) and SHOWTIME.",
        cta: "Subscribe",
        bg: "from-[hsl(141,73%,20%)] to-[hsl(141,73%,42%)]",
        image: "/assets/spotify-bg.svg",
        logoSvg:
            "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
        category: "Entertainment",
        verificationMethod: "SheerID",
        estimatedValue: "$72/year savings",
        featured: true,
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Europe", available: true },
            { region: "Australia", available: true },
        ],
        terms: [
            "Requires a valid .edu email or university verification.",
            "Plan renews at student price as long as you remain eligible.",
            "Hulu and SHOWTIME bundle available in the US only.",
            "Limit of 1 Premium account per person.",
        ],
        guidelines: [
            "Sign up at spotify.com/student.",
            "Verify student status via SheerID.",
            "Enjoy 1 month free, then 50% off.",
        ],
    },
    {
        id: "youtube-premium",
        tags: ["Video", "Music"],
        brand: "YouTube Premium",
        subtitle: "Ad-free streaming",
        discount: "$7.99/mo",
        detail: "YouTube Music included. Background play, downloads, and no ads. Cancel anytime.",
        cta: "Subscribe",
        bg: "from-[hsl(0,82%,35%)] to-[hsl(0,70%,50%)]",
        image: "/assets/adobe-bg.svg",
        logoSvg:
            "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
        category: "Entertainment",
        verificationMethod: "SheerID",
        estimatedValue: "$72/year savings",
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Europe", available: true },
        ],
        terms: [
            "Student verification via SheerID required.",
            "Monthly plan, cancel anytime.",
            "Reverts to standard pricing after graduation.",
        ],
        guidelines: [
            "Go to youtube.com/premium/student.",
            "Verify student status with SheerID.",
            "Start your discounted subscription.",
        ],
    },
    {
        id: "apple-music",
        tags: ["Music"],
        brand: "Apple Music",
        subtitle: "Student subscription",
        discount: "$5.99/mo",
        detail: "Full Apple Music catalog plus Apple TV+ included free. Spatial Audio with Dolby Atmos.",
        cta: "Subscribe",
        bg: "from-[hsl(340,80%,40%)] to-[hsl(280,60%,50%)]",
        image: "/assets/nike-bg.png",
        logoSvg:
            "M23.994 6.124a3.03 3.03 0 00-2.135-2.148C19.93 3.5 12 3.5 12 3.5S4.07 3.5 2.142 3.976A3.03 3.03 0 00.007 6.124 31.75 31.75 0 000 12a31.75 31.75 0 00.007 5.876 3.03 3.03 0 002.135 2.148C4.07 20.5 12 20.5 12 20.5s7.93 0 9.859-.476a3.03 3.03 0 002.135-2.148A31.75 31.75 0 0024 12a31.75 31.75 0 00-.006-5.876z",
        category: "Entertainment",
        verificationMethod: "UNiDAYS verification",
        estimatedValue: "$60/year savings",
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Worldwide", available: true, note: "Most countries supported" },
        ],
        terms: [
            "Student verification through UNiDAYS required.",
            "Includes Apple TV+ at no extra cost.",
            "Available for up to 4 years.",
        ],
        guidelines: [
            "Open Apple Music app or music.apple.com.",
            "Select the Student plan.",
            "Verify through UNiDAYS.",
        ],
    },
    {
        id: "amazon-prime-student",
        tags: ["Shopping", "Streaming"],
        brand: "Amazon Prime Student",
        subtitle: "6 months free trial",
        discount: "6 months free",
        detail: "Free delivery, Prime Video, Prime Music, Prime Reading. Then $7.49/mo (50% off).",
        cta: "Start free trial",
        bg: "from-[hsl(30,90%,30%)] to-[hsl(40,85%,45%)]",
        image: "/assets/travel-bg.svg",
        logoSvg:
            "M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.222-.095.352-.063.39.096.058.236-.127.468-.553.696-2.78 1.488-5.77 2.233-8.972 2.233-4.142 0-7.924-1.262-11.345-3.787-.258-.19-.36-.345-.303-.467l-.197-.18z",
        category: "Entertainment",
        verificationMethod: ".edu email",
        estimatedValue: "$500+/year",
        featured: true,
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Canada", available: true },
        ],
        terms: [
            "Valid .edu email required.",
            "6-month free trial, then $7.49/mo.",
            "Includes Prime Video, Music, Reading, and free shipping.",
            "Cancel anytime during or after trial.",
        ],
        guidelines: [
            "Go to amazon.com/joinstudent.",
            "Sign in or create an Amazon account.",
            "Enter your .edu email to verify.",
        ],
    },
    {
        id: "discord-nitro",
        tags: ["Gaming", "Social"],
        brand: "Discord Nitro",
        subtitle: "Free with GitHub Student Pack",
        discount: "Free 3 months",
        detail: "Custom emoji, HD streaming, 100MB uploads, and server boosts included.",
        cta: "Claim now",
        bg: "from-[hsl(235,86%,45%)] to-[hsl(235,86%,65%)]",
        image: "/assets/spotify-bg.svg",
        logoSvg:
            "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z",
        category: "Entertainment",
        verificationMethod: "GitHub Student Developer Pack",
        estimatedValue: "$30",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Requires active GitHub Student Developer Pack.",
            "3-month free trial of Discord Nitro.",
            "Reverts to free plan after trial ends.",
        ],
    },

    // ─── TECH & SOFTWARE ─────────────────────────────────────────────
    {
        id: "apple-education",
        tags: ["Tech", "Hardware"],
        brand: "Apple Education",
        subtitle: "MacBook Air M2",
        discount: "Save $100",
        detail: "Plus get a $150 Apple Gift Card. Free AirPods with select models during Back to School.",
        cta: "Shop now",
        bg: "from-[hsl(0,0%,5%)] to-[hsl(220,20%,15%)]",
        image: "/assets/apple-bg.svg",
        logoSvg:
            "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z",
        category: "Tech & Software",
        verificationMethod: "Student ID or enrollment proof",
        estimatedValue: "$250+",
        featured: true,
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true, note: "Pricing in GBP" },
            { region: "Europe", available: true, note: "Via Apple Education Store" },
            { region: "Australia", available: true },
        ],
        terms: [
            "Available to current and newly accepted university students.",
            "Faculty and staff also eligible. Limit 1 desktop, 1 laptop per year.",
            "Gift card offer valid during Back to School season only.",
            "Cannot combine with employee discounts or other promotions.",
        ],
        minimumSpend: 50,
        howToRedeem: "Shop through apple.com/education or visit an Apple Store. Bring valid student ID for in-store purchases. The back-to-school gift card will be delivered via email after your product ships.",
        termsUrl: "https://www.apple.com/us-hed/shop/back-to-school/terms-conditions",
        guidelines: [
            "Shop through apple.com/education or visit an Apple Store.",
            "Bring valid student ID for in-store purchases.",
            "Gift card delivered via email after product ships.",
        ],
    },
    {
        id: "adobe-cc",
        tags: ["Software", "Creative"],
        brand: "Adobe CC",
        subtitle: "All Apps Plan",
        discount: "60% off",
        detail: "First year for students & teachers. Photoshop, Illustrator, Premiere Pro & 20+ apps.",
        cta: "Subscribe",
        bg: "from-[hsl(0,82%,35%)] to-[hsl(330,70%,45%)]",
        image: "/assets/adobe-bg.svg",
        logoSvg:
            "M9.07 7L5 21h3.24l1.05-3.68h4.42L14.76 21H18L13.93 7H9.07zm-.14 8l1.57-5.52h.01L12.08 15H8.93zM0 0v24h9.8L0 0zm24 0L14.2 24H24V0z",
        category: "Tech & Software",
        verificationMethod: "School email or enrollment proof",
        estimatedValue: "$420/year",
        featured: true,
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Europe", available: true },
            { region: "Asia Pacific", available: true, note: "Pricing varies" },
        ],
        terms: [
            "Must be 13+ and enrolled in an accredited institution.",
            "First year at student price; standard pricing applies after.",
            "Includes 100GB cloud storage.",
            "Annual plan with monthly payments. Early termination fee applies.",
        ],
        guidelines: [
            "Provide school-issued email or upload enrollment proof.",
            "Re-validate eligibility after the first year.",
        ],
    },
    {
        id: "github-pro",
        tags: ["Dev Tools"],
        brand: "GitHub Pro",
        subtitle: "Student Developer Pack",
        discount: "Free",
        detail: "GitHub Pro, Copilot, CI/CD minutes, Codespaces hours, and 80+ partner tools.",
        cta: "Claim pack",
        bg: "from-[hsl(250,40%,25%)] to-[hsl(260,50%,40%)]",
        image: "/assets/spotify-bg.svg",
        logoSvg:
            "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
        category: "Tech & Software",
        verificationMethod: "Student ID photo upload",
        estimatedValue: "$1,200+/year",
        featured: true,
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Must be a student 13+ enrolled in a degree-granting institution.",
            "Free for the duration of your studies.",
            "Includes GitHub Copilot, Actions minutes, and Codespaces hours.",
        ],
        guidelines: [
            "Go to education.github.com.",
            "Sign up with your school email.",
            "Upload a photo of your student ID.",
        ],
    },
    {
        id: "notion",
        tags: ["Productivity"],
        brand: "Notion",
        subtitle: "Plus Plan",
        discount: "Free forever",
        detail: "Unlimited blocks, file uploads, 30-day page history, and Notion AI trial.",
        cta: "Sign up",
        bg: "from-[hsl(0,0%,5%)] to-[hsl(0,0%,20%)]",
        image: "/assets/apple-bg.svg",
        logoSvg:
            "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.29 2.168c-.42-.326-.98-.7-2.054-.607L3.019 2.648c-.466.046-.56.28-.374.466l1.814 1.094zm.793 3.172v13.856c0 .746.374 1.026 1.213.98l14.523-.84c.84-.046.934-.56.934-1.166V6.354c0-.606-.234-.933-.746-.886l-15.177.886c-.56.047-.747.327-.747.886v.14z",
        category: "Tech & Software",
        verificationMethod: ".edu email",
        estimatedValue: "$96/year",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Sign up with your .edu email.",
            "Free Plus plan for students. No credit card required.",
        ],
        guidelines: [
            "Create an account with your .edu email.",
            "Notion automatically upgrades your plan.",
        ],
    },
    {
        id: "figma",
        tags: ["Design"],
        brand: "Figma",
        subtitle: "Professional plan",
        discount: "Free",
        detail: "Unlimited projects, version history, team libraries, and dev mode.",
        cta: "Get Figma",
        bg: "from-[hsl(340,80%,55%)] to-[hsl(280,60%,50%)]",
        image: "/assets/nike-bg.png",
        logoSvg:
            "M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 8.942v-7.471h-4.588c-2.476 0-4.49 2.014-4.49 4.49s2.014 4.49 4.49 4.49h.001c2.476 0 4.587-2.014 4.587-4.49v-1.019zm-4.587 3.019c-1.665 0-3.019-1.355-3.019-3.019s1.354-3.02 3.019-3.02h3.117v3.02c0 1.664-1.452 3.019-3.117 3.019z",
        category: "Tech & Software",
        verificationMethod: ".edu email or enrollment proof",
        estimatedValue: "$144/year",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Verify with .edu email or school enrollment proof.",
            "Professional plan features included at no cost.",
        ],
        guidelines: [
            "Go to figma.com/education.",
            "Apply with your school email.",
            "Get approved within a few days.",
        ],
    },
    {
        id: "jetbrains",
        tags: ["Dev Tools", "Software"],
        brand: "JetBrains",
        subtitle: "All IDEs Free",
        discount: "Free",
        detail: "IntelliJ IDEA, PyCharm, WebStorm, and all other JetBrains IDEs completely free.",
        cta: "Apply now",
        bg: "from-[hsl(270,60%,25%)] to-[hsl(300,50%,40%)]",
        image: "/assets/adobe-bg.svg",
        logoSvg: "M0 0v24h24V0H0zm2.25 21.75h6v1.5h-6v-1.5zM21 21H3V3h18v18z",
        category: "Tech & Software",
        verificationMethod: ".edu email or ISIC card",
        estimatedValue: "$649/year",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Free license for students and teachers.",
            "Must renew annually with student verification.",
            "For non-commercial, educational use only.",
        ],
        guidelines: [
            "Apply at jetbrains.com/community/education.",
            "Use your school email for instant approval.",
            "Download any IDE from the Toolbox App.",
        ],
    },
    {
        id: "microsoft-365",
        tags: ["Productivity", "Software"],
        brand: "Microsoft 365",
        subtitle: "Education Edition",
        discount: "Free",
        detail: "Word, Excel, PowerPoint, OneNote, Teams, and 1TB OneDrive storage.",
        cta: "Get free",
        bg: "from-[hsl(210,80%,30%)] to-[hsl(210,80%,50%)]",
        image: "/assets/travel-bg.svg",
        logoSvg:
            "M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801",
        category: "Tech & Software",
        verificationMethod: ".edu email",
        estimatedValue: "$100/year",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Available to students at eligible institutions.",
            "Includes web and desktop versions of Office apps.",
            "1TB OneDrive cloud storage included.",
        ],
        guidelines: [
            "Go to microsoft.com/education.",
            "Enter your school email address.",
            "Follow the setup instructions.",
        ],
    },
    {
        id: "canva-pro",
        tags: ["Design", "Creative"],
        brand: "Canva Pro",
        subtitle: "Free for students",
        discount: "Free",
        detail: "Premium templates, Brand Kit, Background Remover, 1TB storage, and Magic Write AI.",
        cta: "Get Canva Pro",
        bg: "from-[hsl(260,70%,40%)] to-[hsl(290,80%,55%)]",
        image: "/assets/nike-bg.png",
        logoSvg:
            "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm2.14 16.87c-.696 1.327-1.913 2.13-3.263 2.13-2.618 0-4.377-2.63-4.377-6.06 0-3.96 2.174-6.94 5.144-6.94 1.204 0 2.18.592 2.857 1.527.087.113.15.238.238.363l-1.4 1.102c-.447-.64-.87-1.102-1.6-1.102-1.69 0-2.85 2.03-2.85 4.98 0 2.478.945 4.175 2.648 4.175.93 0 1.58-.538 2.052-1.377l1.55 1.202z",
        category: "Tech & Software",
        verificationMethod: ".edu email",
        estimatedValue: "$120/year",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Available to students and teachers at eligible schools.",
            "Includes all Canva Pro features.",
            "Register with your school email.",
        ],
    },

    // ─── FASHION & LIFESTYLE ────────────────────────────────────────
    {
        id: "nike",
        tags: ["Fashion", "Flash Sale"],
        brand: "Nike",
        subtitle: "Member Days",
        discount: "Extra 20% off",
        detail: "Sale items for students with verified ID. Nike App exclusive styles included.",
        cta: "View code",
        bg: "from-[hsl(340,80%,55%)] to-[hsl(0,100%,70%)]",
        image: "/assets/nike-bg.png",
        logoSvg:
            "M1.5 17.5L8.5 8c.5-.7 1.2-1 2-1 .5 0 1 .2 1.4.5l11.6-5c-.2.7-.7 1.8-1.5 3L10 14c-.5.5-1 .5-1.5.3L6 12l-4.5 5.5z",
        category: "Fashion & Lifestyle",
        verificationMethod: "UNiDAYS",
        estimatedValue: "$100+/year",
        featured: true,
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true, note: "Nike.com/gb" },
            { region: "Europe", available: true, note: "Select EU countries via UNiDAYS" },
            { region: "Australia", available: false, note: "Not currently available" },
        ],
        terms: [
            "Student verification via UNiDAYS required.",
            "Discount applies to select sale and full-price items.",
            "Cannot be combined with other promo codes or employee discounts.",
            "Valid on Nike.com and Nike App purchases only.",
        ],
        guidelines: [
            "Create a Nike Member account first.",
            "Verify student status through UNiDAYS.",
            "Apply discount code at checkout.",
        ],
    },
    {
        id: "asos",
        tags: ["Fashion"],
        brand: "ASOS",
        subtitle: "Student discount",
        discount: "10% off always",
        detail: "Ongoing 10% off everything with valid student verification. Works on sale items too.",
        cta: "Shop",
        bg: "from-[hsl(0,0%,5%)] to-[hsl(0,0%,25%)]",
        image: "/assets/spotify-bg.svg",
        logoSvg:
            "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
        category: "Fashion & Lifestyle",
        verificationMethod: "UNiDAYS or Student Beans",
        estimatedValue: "$150+/year",
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Europe", available: true },
            { region: "Australia", available: true },
        ],
        terms: [
            "Verify via UNiDAYS or Student Beans.",
            "10% off applies to full-price and sale items.",
            "Cannot combine with other discount codes.",
        ],
    },
    {
        id: "adidas",
        tags: ["Fashion", "Sports"],
        brand: "Adidas",
        subtitle: "Student Perks",
        discount: "20% off",
        detail: "Storewide discount for verified students. Works on Originals, Performance, and Terrex.",
        cta: "Get code",
        bg: "from-[hsl(0,0%,5%)] to-[hsl(0,0%,18%)]",
        image: "/assets/apple-bg.svg",
        logoSvg: "M14.5 6.5L12 2 9.5 6.5H3L12 22l9-15.5h-6.5zM12 17.6L6.1 8h11.8L12 17.6z",
        category: "Fashion & Lifestyle",
        verificationMethod: "UNiDAYS",
        estimatedValue: "$200+/year",
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Europe", available: true },
        ],
        terms: [
            "Student verification via UNiDAYS required.",
            "20% off full-price items.",
            "Cannot stack with other promo codes.",
        ],
    },
    {
        id: "hm",
        tags: ["Fashion"],
        brand: "H&M",
        subtitle: "Student discount",
        discount: "15% off",
        detail: "Stackable with existing sales. Join H&M loyalty program for extra points.",
        cta: "Get discount",
        bg: "from-[hsl(0,70%,40%)] to-[hsl(0,60%,55%)]",
        image: "/assets/adobe-bg.svg",
        logoSvg: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        category: "Fashion & Lifestyle",
        verificationMethod: "Student Beans",
        estimatedValue: "$80+/year",
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Europe", available: true },
        ],
        terms: [
            "Student Beans verification required.",
            "15% off online and in-store.",
            "Can combine with H&M Member rewards.",
        ],
    },

    // ─── FOOD & DELIVERY ────────────────────────────────────────────
    {
        id: "uber-eats",
        tags: ["Food", "Delivery"],
        brand: "Uber Eats",
        subtitle: "$20 Off First 2 Orders",
        discount: "$20 off",
        detail: "Minimum order $25. Valid for new student accounts. Combine with free delivery.",
        cta: "Copy code",
        bg: "from-[hsl(150,67%,18%)] to-[hsl(160,50%,28%)]",
        image: "/assets/ubereats-bg.svg",
        logoSvg:
            "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3V8h2v8h-2v-2zm5 0h-3v-2h3V8h2v8h-2v-2z",
        category: "Food & Delivery",
        verificationMethod: ".edu email",
        estimatedValue: "$40+",
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true, note: "Via Uber Eats app" },
            { region: "Canada", available: true },
            { region: "Australia", available: false, note: "Coming soon" },
        ],
        terms: [
            "New accounts only. Minimum order of $25 required.",
            "Cannot be combined with other promotions except free delivery.",
            "Valid for 30 days after account creation.",
            "One use per order. Two uses maximum.",
        ],
        guidelines: [
            "Sign up with your .edu email for student verification.",
            "Code auto-applies at checkout for eligible orders.",
        ],
    },
    {
        id: "doordash",
        tags: ["Delivery"],
        brand: "DoorDash",
        subtitle: "DashPass Student",
        discount: "50% off",
        detail: "Free delivery on orders $12+. Reduced service fees. Monthly subscription.",
        cta: "Activate",
        bg: "from-[hsl(0,82%,35%)] to-[hsl(10,80%,50%)]",
        image: "/assets/adobe-bg.svg",
        logoSvg:
            "M23.071 8.409a6.09 6.09 0 00-5.396-3.228H.584A.588.588 0 00.1 6.076l5.344 5.329a6.087 6.087 0 004.3 1.778h11.993a.588.588 0 00.484-.895 6.132 6.132 0 00-.15-.879z",
        category: "Food & Delivery",
        verificationMethod: ".edu email",
        estimatedValue: "$60/year",
        regions: [
            { region: "United States", available: true },
            { region: "Canada", available: true },
            { region: "Australia", available: true },
        ],
        terms: [
            "Student verification required.",
            "DashPass membership at 50% off standard price.",
            "$0 delivery fee on orders $12+.",
        ],
    },
    {
        id: "grubhub-student",
        tags: ["Food", "Delivery"],
        brand: "Grubhub+",
        subtitle: "Free with Prime Student",
        discount: "Free",
        detail: "Unlimited free delivery on $12+ orders. Included with Amazon Prime Student.",
        cta: "Activate",
        bg: "from-[hsl(15,85%,40%)] to-[hsl(25,90%,55%)]",
        image: "/assets/travel-bg.svg",
        logoSvg:
            "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z",
        category: "Food & Delivery",
        verificationMethod: "Amazon Prime Student",
        estimatedValue: "$120/year",
        regions: [{ region: "United States", available: true }],
        terms: [
            "Requires active Amazon Prime Student membership.",
            "Free delivery on orders $12+.",
            "Available at participating restaurants.",
        ],
    },
    {
        id: "starbucks-student",
        tags: ["Food", "Coffee"],
        brand: "Starbucks",
        subtitle: "Student Rewards Bonus",
        discount: "2x Stars",
        detail: "Earn double Starbucks Stars on every purchase with student verification.",
        cta: "Join rewards",
        bg: "from-[hsl(155,60%,20%)] to-[hsl(155,50%,35%)]",
        image: "/assets/spotify-bg.svg",
        logoSvg:
            "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z",
        category: "Food & Delivery",
        verificationMethod: "Starbucks app + Student Beans",
        estimatedValue: "$100+/year",
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
        ],
        terms: [
            "Must be a Starbucks Rewards member.",
            "Student verification via Student Beans.",
            "Double Stars on qualifying purchases.",
        ],
    },

    // ─── TRAVEL ────────────────────────────────────────────────────
    {
        id: "studentuniverse",
        tags: ["Travel", "Flights"],
        brand: "StudentUniverse",
        subtitle: "Exclusive Student Flights",
        discount: "Up to 30% off",
        detail: "Flights to Europe, Asia & more. Exclusive fares not available anywhere else.",
        cta: "Search flights",
        bg: "from-[hsl(190,60%,30%)] to-[hsl(200,70%,45%)]",
        image: "/assets/travel-bg.svg",
        logoSvg:
            "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
        category: "Travel",
        verificationMethod: ".edu email or student ID",
        estimatedValue: "$500+/year",
        featured: true,
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Europe", available: true },
            { region: "Asia", available: true },
        ],
        terms: [
            "Must be 18-25 with valid student ID.",
            "Fares subject to availability and airline terms.",
            "Booking fees may apply. Changes subject to airline policy.",
        ],
        guidelines: [
            "Create a StudentUniverse account with .edu email.",
            "Compare prices with other booking sites before purchasing.",
        ],
    },
    {
        id: "amtrak-student",
        tags: ["Travel", "Rail"],
        brand: "Amtrak",
        subtitle: "Student discount",
        discount: "15% off",
        detail: "Save on Amtrak tickets nationwide. Valid on most routes and fare types.",
        cta: "Book now",
        bg: "from-[hsl(210,70%,30%)] to-[hsl(210,80%,50%)]",
        image: "/assets/travel-bg.svg",
        logoSvg: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        category: "Travel",
        verificationMethod: "Student Advantage card or .edu email",
        estimatedValue: "$200/year",
        regions: [{ region: "United States", available: true }],
        terms: [
            "15% off most Amtrak fares.",
            "Blackout dates may apply during peak travel.",
            "Must present valid student ID on board.",
        ],
    },
    {
        id: "eurail-youth",
        tags: ["Travel", "Rail"],
        brand: "Eurail",
        subtitle: "Youth Pass (under 27)",
        discount: "Up to 25% off",
        detail: "Unlimited train travel across 33 European countries at discounted youth rates.",
        cta: "Get pass",
        bg: "from-[hsl(200,60%,25%)] to-[hsl(220,70%,45%)]",
        image: "/assets/apple-bg.svg",
        logoSvg: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        category: "Travel",
        verificationMethod: "Age verification (under 27)",
        estimatedValue: "$100+",
        regions: [{ region: "Europe", available: true }],
        terms: [
            "Available to travelers under 27.",
            "Discounted compared to standard adult passes.",
            "Choose from multiple pass durations.",
        ],
    },

    // ─── LEARNING ──────────────────────────────────────────────────
    {
        id: "coursera-student",
        tags: ["Learning", "Courses"],
        brand: "Coursera",
        subtitle: "Coursera Plus for Students",
        discount: "Up to 50% off",
        detail: "Access 7,000+ courses and professional certificates from top universities.",
        cta: "Start learning",
        bg: "from-[hsl(210,80%,35%)] to-[hsl(210,90%,55%)]",
        image: "/assets/travel-bg.svg",
        logoSvg:
            "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z",
        category: "Learning",
        verificationMethod: ".edu email",
        estimatedValue: "$250+/year",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Student verification required.",
            "Access thousands of courses and certificates.",
            "Annual billing.",
        ],
    },
    {
        id: "linkedin-learning",
        tags: ["Learning", "Career"],
        brand: "LinkedIn Learning",
        subtitle: "Free via university",
        discount: "Free",
        detail: "16,000+ courses on business, tech, and creative topics. Certificates included.",
        cta: "Check access",
        bg: "from-[hsl(210,80%,30%)] to-[hsl(210,80%,45%)]",
        image: "/assets/apple-bg.svg",
        logoSvg:
            "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
        category: "Learning",
        verificationMethod: "University portal login",
        estimatedValue: "$360/year",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Available through many university partnerships.",
            "Check with your university library or career center.",
            "Full access to all courses during enrollment.",
        ],
    },
    {
        id: "datacamp-student",
        tags: ["Learning", "Data Science"],
        brand: "DataCamp",
        subtitle: "Student plan",
        discount: "Free",
        detail: "Learn Python, R, SQL, and data science. 400+ courses with hands-on exercises.",
        cta: "Claim access",
        bg: "from-[hsl(155,60%,25%)] to-[hsl(170,70%,40%)]",
        image: "/assets/spotify-bg.svg",
        logoSvg: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        category: "Learning",
        verificationMethod: ".edu email or GitHub Student Pack",
        estimatedValue: "$300/year",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Free access through GitHub Student Developer Pack.",
            "3 months of DataCamp premium.",
            "All courses and projects included.",
        ],
    },

    // ─── HEALTH & WELLNESS ────────────────────────────────────────
    {
        id: "headspace-student",
        tags: ["Health", "Wellness"],
        brand: "Headspace",
        subtitle: "Student plan",
        discount: "$9.99/year",
        detail: "Full access to guided meditations, sleep sounds, focus music, and mindfulness exercises.",
        cta: "Start meditating",
        bg: "from-[hsl(30,70%,40%)] to-[hsl(40,80%,55%)]",
        image: "/assets/nike-bg.png",
        logoSvg:
            "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
        category: "Health & Wellness",
        verificationMethod: ".edu email or SheerID",
        estimatedValue: "$60/year savings",
        regions: [
            { region: "United States", available: true },
            { region: "United Kingdom", available: true },
            { region: "Australia", available: true },
        ],
        terms: [
            "Student verification required.",
            "$9.99/year vs $69.99/year standard.",
            "Full access to all content.",
        ],
    },
    {
        id: "grammarly-premium",
        tags: ["Productivity", "Writing"],
        brand: "Grammarly",
        subtitle: "Premium for students",
        discount: "Up to 40% off",
        detail: "Advanced grammar, tone, and plagiarism checks. AI writing assistant included.",
        cta: "Get premium",
        bg: "from-[hsl(155,70%,25%)] to-[hsl(155,60%,40%)]",
        image: "/assets/spotify-bg.svg",
        logoSvg:
            "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z",
        category: "Tech & Software",
        verificationMethod: ".edu email",
        estimatedValue: "$85/year",
        regions: [{ region: "Worldwide", available: true }],
        terms: [
            "Discounted pricing for students.",
            "Includes plagiarism detection.",
            "Works across browsers and apps.",
        ],
    },
];

export const categories = [
    "Entertainment",
    "Tech & Software",
    "Fashion & Lifestyle",
    "Food & Delivery",
    "Travel",
    "Learning",
    "Health & Wellness",
];

export const getDealsByCategory = (category: string) =>
    allDeals.filter((d) => d.category === category);

export const getDealById = (id: string) => allDeals.find((d) => d.id === id);

export const getTopDeals = () => allDeals.filter((d) => d.featured).slice(0, 6);

export const getFeaturedDeals = () => allDeals.filter((d) => d.featured);

export const getSimilarDeals = (deal: DealData) =>
    allDeals.filter((d) => d.id !== deal.id && d.category === deal.category).slice(0, 4);

export const searchDeals = (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return allDeals;
    return allDeals.filter(
        (d) =>
            d.brand.toLowerCase().includes(q) ||
            d.tags.some((t) => t.toLowerCase().includes(q)) ||
            d.discount.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q) ||
            d.detail.toLowerCase().includes(q) ||
            d.subtitle.toLowerCase().includes(q)
    );
};
