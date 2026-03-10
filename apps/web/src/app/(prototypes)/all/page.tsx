"use client"

import { useState, useEffect, useRef } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────
const FontLink = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;0,900;1,300;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #080D1A;
      --surface:   #0F1629;
      --card:      #131C31;
      --card-hover:#18243C;
      --border:    #1E2D48;
      --border-lit:#2A3F62;
      --lime:      #A3E635;
      --lime-dim:  #84CC16;
      --lime-glow: rgba(163,230,53,0.15);
      --amber:     #FCD34D;
      --red:       #F87171;
      --txt:       #E8EEF8;
      --txt-2:     #8496B8;
      --txt-3:     #4A607E;
      --sans:      'Plus Jakarta Sans', sans-serif;
      --serif:     'Fraunces', Georgia, serif;
    }

    body { background: var(--bg); color: var(--txt); font-family: var(--sans); }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--surface); }
    ::-webkit-scrollbar-thumb { background: var(--border-lit); border-radius: 3px; }

    /* Animations */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(18px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes shimmer {
      from { background-position: -400px 0; }
      to   { background-position: 400px 0; }
    }
    @keyframes pulse-lime {
      0%,100% { box-shadow: 0 0 0 0 rgba(163,230,53,0); }
      50%      { box-shadow: 0 0 0 8px rgba(163,230,53,0.15); }
    }
    @keyframes ticker {
      from { transform: translateX(100%); }
      to   { transform: translateX(-100%); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .fade-up { animation: fadeUp 0.45s ease both; }
    .fade-up-1 { animation: fadeUp 0.45s 0.05s ease both; }
    .fade-up-2 { animation: fadeUp 0.45s 0.10s ease both; }
    .fade-up-3 { animation: fadeUp 0.45s 0.15s ease both; }
    .fade-up-4 { animation: fadeUp 0.45s 0.20s ease both; }
    .fade-up-5 { animation: fadeUp 0.45s 0.25s ease both; }
  `}</style>
);

// ── Mock Data ─────────────────────────────────────────────────────────────
const DEALS = [
    { id: "1", slug: "spotify-premium-student", title: "Spotify Premium Student", brand: "Spotify", brandSlug: "spotify", logo: "🟢", category: "Music", categorySlug: "music", discount: "50% OFF", price: "£4.99/mo", original: "£9.99/mo", tag: "Verified", region: "🇬🇧", device: "📱🖥️", hot: true, featured: true, desc: "Get ad-free music, offline downloads and unlimited skips.", verify: "SheerID", expires: "Dec 2025", newOnly: true, color: "#1DB954" },
    { id: "2", slug: "adobe-creative-cloud-free", title: "Adobe Creative Cloud Free", brand: "Adobe", brandSlug: "adobe", logo: "🔴", category: "Tech & Software", categorySlug: "tech-software", discount: "FREE", price: "Free for 1yr", original: "£54.99/mo", tag: "Hot", region: "🌍", device: "🖥️", hot: true, featured: true, desc: "Access to 20+ creative apps including Photoshop, Illustrator, Premiere.", verify: "EDU Email", color: "#FF0000" },
    { id: "3", slug: "github-student-pack", title: "GitHub Student Pack", brand: "GitHub", brandSlug: "github", logo: "⚫", category: "Tech & Software", categorySlug: "tech-software", discount: "FREE", price: "Free (worth £200+)", original: "—", tag: "Essential", region: "🌍", device: "🖥️", hot: false, featured: true, desc: "60+ developer tools, GitHub Pro, and tonnes of cloud credits.", verify: "EDU Email", color: "#333" },
    { id: "4", slug: "asos-student-discount", title: "ASOS Student Discount", brand: "ASOS", brandSlug: "asos", logo: "🟣", category: "Fashion", categorySlug: "fashion", discount: "10% OFF", price: "10% all orders", original: "—", tag: "", region: "🇬🇧🇺🇸", device: "📱🖥️", hot: false, featured: false, desc: "10% off everything, all the time. No minimum spend.", verify: "UNiDAYS", color: "#8B5CF6" },
    { id: "5", slug: "notion-plus-free", title: "Notion Plus Free", brand: "Notion", brandSlug: "notion", logo: "⬜", category: "Productivity", categorySlug: "productivity", discount: "FREE", price: "Free for 1yr", original: "£10/mo", tag: "", region: "🌍", device: "📱🖥️", hot: false, featured: false, desc: "Unlimited blocks, unlimited file uploads, 30-day version history.", verify: "EDU Email", color: "#000" },
    { id: "6", slug: "apple-music-student", title: "Apple Music Student", brand: "Apple Music", brandSlug: "apple-music", logo: "🍎", category: "Music", categorySlug: "music", discount: "50% OFF", price: "£5.99/mo", original: "£10.99/mo", tag: "", region: "🇬🇧🇺🇸", device: "📱", hot: false, featured: false, desc: "100M songs in lossless audio. Spatial Audio with Dolby Atmos.", verify: "UNiDAYS", color: "#FC3C44" },
    { id: "7", slug: "student-beans-fashion", title: "Deliveroo Student Discount", brand: "Deliveroo", brandSlug: "deliveroo", logo: "🟦", category: "Food & Drink", categorySlug: "food-drink", discount: "25% OFF", price: "25% first 3 orders", original: "—", tag: "", region: "🇬🇧", device: "📱", hot: false, featured: false, desc: "25% off your first 3 orders when you verify your student status.", verify: "Student Beans", color: "#00CCBC" },
    { id: "8", slug: "jetbrains-all-products", title: "JetBrains All Products", brand: "JetBrains", brandSlug: "jetbrains", logo: "🟠", category: "Tech & Software", categorySlug: "tech-software", discount: "FREE", price: "Free while studying", original: "£69.99/mo", tag: "Essential", region: "🌍", device: "🖥️", hot: false, featured: false, desc: "All JetBrains IDEs free. IntelliJ, PyCharm, WebStorm, and more.", verify: "EDU Email", color: "#FE2857" },
];

const BRANDS = {
    spotify: { name: "Spotify", logo: "🟢", tagline: "Music for everyone", website: "spotify.com", verified: true, desc: "The world's most popular audio streaming platform with 600M+ users.", love: "Easiest student verification and always the best student price.", clicks: "12.4K", deals: 3, color: "#1DB954" },
    adobe: { name: "Adobe", logo: "🔴", tagline: "Creativity for all", website: "adobe.com", verified: true, desc: "The global leader in creative software, from Photoshop to Premiere Pro.", love: "The full Creative Cloud suite free for a year — genuinely unbeatable.", clicks: "9.8K", deals: 2, color: "#FF0000" },
};

const CATEGORIES = [
    { slug: "tech-software", name: "Tech & Software", icon: "💻", count: 18, color: "#3B82F6", desc: "Apps, tools, subscriptions and developer platforms." },
    { slug: "music", name: "Music", icon: "🎵", count: 12, color: "#EC4899", desc: "Streaming services, downloads and live music." },
    { slug: "food-drink", name: "Food & Drink", icon: "🍕", count: 9, color: "#F59E0B", desc: "Delivery apps, cafés and restaurants." },
    { slug: "fashion", name: "Fashion", icon: "👗", count: 14, color: "#8B5CF6", desc: "Clothing, shoes and accessories." },
    { slug: "travel", name: "Travel", icon: "✈️", count: 8, color: "#10B981", desc: "Flights, trains, hotels and experiences." },
    { slug: "productivity", name: "Productivity", icon: "📚", count: 11, color: "#EF4444", desc: "Notes, writing and study tools." },
];

const REGIONS = [
    { code: "gb", flag: "🇬🇧", name: "United Kingdom", count: 34 },
    { code: "us", flag: "🇺🇸", name: "United States", count: 41 },
    { code: "au", flag: "🇦🇺", name: "Australia", count: 22 },
    { code: "ca", flag: "🇨🇦", name: "Canada", count: 19 },
    { code: "de", flag: "🇩🇪", name: "Germany", count: 15 },
    { code: "fr", flag: "🇫🇷", name: "France", count: 14 },
    { code: "in", flag: "🇮🇳", name: "India", count: 11 },
];

const PERSONAS = [
    { slug: "cs-students", icon: "👨‍💻", title: "CS Students", subtitle: "The Developer Stack" },
    { slug: "art-students", icon: "🎨", title: "Art Students", subtitle: "The Creative Stack" },
    { slug: "med-students", icon: "🏥", title: "Med Students", subtitle: "The Study Stack" },
    { slug: "business", icon: "📊", title: "Business Students", subtitle: "The Hustle Stack" },
];

// ── Shared Components ─────────────────────────────────────────────────────
const Nav = ({ page, setPage }) => {
    const [open, setOpen] = useState(false);
    return (
        <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid var(--border)`, background: "rgba(8,13,26,0.92)", backdropFilter: "blur(16px)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22, fontFamily: "var(--serif)", fontWeight: 700, color: "var(--lime)" }}>UniPerks</span>
                    <span style={{ fontSize: 10, background: "var(--lime)", color: "#000", padding: "2px 6px", borderRadius: 4, fontWeight: 700, letterSpacing: 1 }}>BETA</span>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {[
                        ["Browse", "browse"],
                        ["Tech", "category"],
                        ["UK Deals", "location"],
                        ["CS Students", "persona"],
                        ["Spotify vs Apple", "compare"],
                    ].map(([label, p]) => (
                        <button key={p} onClick={() => setPage(p)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontFamily: "var(--sans)", fontWeight: 500, color: page === p ? "var(--lime)" : "var(--txt-2)", transition: "color 0.2s" }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

const Ticker = () => (
    <div style={{ background: "var(--lime)", overflow: "hidden", height: 32, display: "flex", alignItems: "center" }}>
        <div style={{ animation: "ticker 28s linear infinite", whiteSpace: "nowrap", fontSize: 12, fontWeight: 700, color: "#000", fontFamily: "var(--sans)", letterSpacing: 0.5 }}>
            &nbsp;&nbsp;🔥 Spotify 50% OFF &nbsp;·&nbsp; 🎨 Adobe CC FREE &nbsp;·&nbsp; ⚫ GitHub Student Pack FREE &nbsp;·&nbsp; 👗 ASOS 10% OFF &nbsp;·&nbsp; ⬜ Notion Plus FREE &nbsp;·&nbsp; 🍕 Deliveroo 25% OFF &nbsp;·&nbsp; 🎵 Apple Music 50% OFF &nbsp;·&nbsp; 🟠 JetBrains All IDEs FREE &nbsp;&nbsp;
        </div>
    </div>
);

const DealBadge = ({ text, type = "default" }) => {
    const colors = { hot: "#EF4444", verified: "var(--lime-dim)", essential: "var(--amber)", default: "var(--border-lit)" };
    const textC = { hot: "#fff", verified: "#000", essential: "#000", default: "var(--txt-2)" };
    return (
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, padding: "2px 7px", borderRadius: 20, background: colors[type] || colors.default, color: textC[type] || textC.default, textTransform: "uppercase" }}>
            {text}
        </span>
    );
};

const DealCard = ({ deal, setPage, setSelected, size = "normal" }) => {
    const [hov, setHov] = useState(false);
    const compact = size === "compact";
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            onClick={() => { setSelected(deal.slug); setPage("deal"); }}
            style={{ background: hov ? "var(--card-hover)" : "var(--card)", border: `1px solid ${hov ? "var(--border-lit)" : "var(--border)"}`, borderRadius: 16, padding: compact ? 16 : 20, cursor: "pointer", transition: "all 0.2s", transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? "0 12px 32px rgba(0,0,0,0.4)" : "none", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}
        >
            {deal.featured && <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderTop: "36px solid var(--lime)", borderLeft: "36px solid transparent" }} />}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: deal.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: `1px solid ${deal.color}33` }}>
                    {deal.logo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--txt-3)", fontWeight: 500, marginBottom: 2 }}>{deal.brand}</div>
                    <div style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: "var(--txt)", lineHeight: 1.3, fontFamily: "var(--sans)" }}>{deal.title}</div>
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: compact ? 15 : 18, fontWeight: 900, color: "var(--lime)", fontFamily: "var(--serif)" }}>{deal.discount}</span>
                {deal.tag && <DealBadge text={deal.tag} type={deal.tag.toLowerCase().replace(" ", "_")} />}
            </div>
            <div style={{ fontSize: 13, color: "var(--txt-2)", lineHeight: 1.4 }}>{deal.price}{deal.original !== "—" && <span style={{ marginLeft: 6, textDecoration: "line-through", color: "var(--txt-3)", fontSize: 12 }}>{deal.original}</span>}</div>
            {!compact && <div style={{ fontSize: 12, color: "var(--txt-3)", lineHeight: 1.4 }}>{deal.desc}</div>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <span style={{ fontSize: 11, color: "var(--txt-3)" }}>{deal.region} {deal.device}</span>
                <div style={{ background: hov ? "var(--lime)" : "var(--lime-glow)", color: hov ? "#000" : "var(--lime)", border: "1px solid var(--lime-dim)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}>
                    Claim →
                </div>
            </div>
        </div>
    );
};

const Pill = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{ background: active ? "var(--lime)" : "var(--card)", border: `1px solid ${active ? "var(--lime)" : "var(--border)"}`, color: active ? "#000" : "var(--txt-2)", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "var(--sans)", whiteSpace: "nowrap" }}>
        {label}
    </button>
);

const SectionTitle = ({ children, sub }) => (
    <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--txt)", lineHeight: 1.2 }}>{children}</h2>
        {sub && <p style={{ marginTop: 6, fontSize: 14, color: "var(--txt-2)" }}>{sub}</p>}
    </div>
);

const BackBtn = ({ onClick }) => (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--txt-2)", fontSize: 13, fontWeight: 500, fontFamily: "var(--sans)", marginBottom: 24, padding: "6px 0" }}>
        ← Back
    </button>
);

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: BROWSE
// ═══════════════════════════════════════════════════════════════════════════
const BrowsePage = ({ setPage, setSelected }) => {
    const [cat, setCat] = useState("All");
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState("All");
    const [showDrop, setShowDrop] = useState(false);
    const [suggest, setSuggest] = useState([]);

    const cats = ["All", ...CATEGORIES.map(c => c.name)];

    const filtered = DEALS.filter(d => {
        const inCat = cat === "All" || d.category === cat;
        const inSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.brand.toLowerCase().includes(search.toLowerCase());
        return inCat && inSearch;
    });

    const handleSearch = (v) => {
        setSearch(v);
        if (v.length > 1) {
            const s = DEALS.filter(d => d.brand.toLowerCase().startsWith(v.toLowerCase()) || d.title.toLowerCase().includes(v.toLowerCase())).slice(0, 5);
            setSuggest(s);
            setShowDrop(true);
        } else {
            setShowDrop(false);
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
            {/* Header */}
            <div className="fade-up" style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
                    <h1 style={{ fontFamily: "var(--serif)", fontSize: 42, fontWeight: 900, color: "var(--txt)", lineHeight: 1 }}>Student Deals</h1>
                    <span style={{ fontSize: 14, color: "var(--txt-3)", fontWeight: 500 }}>{filtered.length} deals</span>
                </div>
                <p style={{ fontSize: 15, color: "var(--txt-2)" }}>Every verified student discount, in one place. No sign-up needed.</p>
            </div>

            {/* Search bar */}
            <div className="fade-up-1" style={{ position: "relative", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", background: "var(--card)", border: "1px solid var(--border-lit)", borderRadius: 14, padding: "0 16px", gap: 12, transition: "border-color 0.2s" }}>
                    <span style={{ fontSize: 18, opacity: 0.5 }}>🔍</span>
                    <input
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                        onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                        placeholder="Search deals, brands, categories..."
                        style={{ flex: 1, background: "none", border: "none", outline: "none", padding: "14px 0", fontSize: 15, color: "var(--txt)", fontFamily: "var(--sans)" }}
                    />
                    {search && <button onClick={() => { setSearch(""); setShowDrop(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--txt-3)", fontSize: 16 }}>✕</button>}
                </div>

                {showDrop && suggest.length > 0 && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--card)", border: "1px solid var(--border-lit)", borderRadius: 14, overflow: "hidden", zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                        <div style={{ padding: "8px 16px 4px", fontSize: 11, color: "var(--txt-3)", fontWeight: 600, letterSpacing: 0.8 }}>DEALS</div>
                        {suggest.map(d => (
                            <div key={d.id} onClick={() => { setSelected(d.slug); setPage("deal"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", borderTop: "1px solid var(--border)" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--card-hover)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <span style={{ fontSize: 20 }}>{d.logo}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--txt)" }}>{d.brand} — {d.title}</div>
                                    <div style={{ fontSize: 12, color: "var(--txt-3)" }}>{d.category}</div>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--lime)" }}>{d.discount}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="fade-up-2" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
                {cats.map(c => <Pill key={c} label={c} active={cat === c} onClick={() => setCat(c)} />)}
                <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
                <Pill label="🌍 All Regions" active={region === "All"} onClick={() => setRegion("All")} />
                <Pill label="🇬🇧 UK Only" active={region === "GB"} onClick={() => setRegion("GB")} />
                <Pill label="🇺🇸 US Only" active={region === "US"} onClick={() => setRegion("US")} />
            </div>

            {/* Source indicator */}
            {search && (
                <div className="fade-up" style={{ marginBottom: 16, fontSize: 12, color: "var(--txt-3)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lime)", display: "inline-block" }} />
                    Showing AI-matched results for "{search}"
                </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "var(--txt-2)" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 8, color: "var(--txt)" }}>No deals found</div>
                    <div style={{ fontSize: 14 }}>Try a different search or browse by category</div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {filtered.map((d, i) => (
                        <div key={d.id} className={`fade-up-${Math.min(i + 1, 5)}`}>
                            <DealCard deal={d} setPage={setPage} setSelected={setSelected} />
                        </div>
                    ))}
                </div>
            )}

            {/* Load more */}
            {filtered.length > 0 && (
                <div style={{ textAlign: "center", marginTop: 48 }}>
                    <button style={{ background: "var(--card)", border: "1px solid var(--border-lit)", color: "var(--txt-2)", borderRadius: 12, padding: "12px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)" }}>
                        Load 20 More Deals
                    </button>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: DEAL DETAIL
// ═══════════════════════════════════════════════════════════════════════════
const DealDetailPage = ({ slug, setPage, setSelected }) => {
    const deal = DEALS.find(d => d.slug === slug) || DEALS[0];
    const [copied, setCopied] = useState(false);
    const [country, setCountry] = useState("GB");

    const countryPrices = {
        GB: { price: "£4.99/mo", original: "£9.99/mo", label: "£4.99/mo", flag: "🇬🇧", avail: true },
        US: { price: "$5.99/mo", original: "$10.99/mo", label: "$5.99/mo + Hulu", flag: "🇺🇸", avail: true },
        DE: { price: "—", original: "—", label: "Unavailable", flag: "🇩🇪", avail: false },
    };
    const geo = countryPrices[country] || countryPrices.GB;

    const similar = DEALS.filter(d => d.category === deal.category && d.id !== deal.id).slice(0, 3);

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
            <BackBtn onClick={() => setPage("browse")} />

            {/* Breadcrumb */}
            <div style={{ fontSize: 12, color: "var(--txt-3)", marginBottom: 28, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ cursor: "pointer", color: "var(--txt-2)" }} onClick={() => setPage("browse")}>Browse</span>
                <span>›</span>
                <span style={{ cursor: "pointer", color: "var(--txt-2)" }} onClick={() => setPage("category")}>{deal.category}</span>
                <span>›</span>
                <span style={{ color: "var(--txt)" }}>{deal.title}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
                {/* LEFT */}
                <div>
                    {/* Brand header */}
                    <div className="fade-up" style={{ background: "var(--card)", borderRadius: 20, padding: 28, marginBottom: 20, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top right, ${deal.color}18, transparent 60%)`, pointerEvents: "none" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 18, background: deal.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: `1px solid ${deal.color}44` }}>
                                {deal.logo}
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 700, color: "var(--txt)" }}>{deal.brand}</span>
                                    <span style={{ fontSize: 12, background: "var(--lime)22", color: "var(--lime)", border: "1px solid var(--lime)44", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>✓ Verified</span>
                                </div>
                                <div style={{ fontSize: 14, color: "var(--txt-2)", marginTop: 2 }}>{deal.category}</div>
                            </div>
                        </div>
                        <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 700, color: "var(--txt)", lineHeight: 1.2, marginBottom: 16 }}>{deal.title}</h1>
                        <p style={{ fontSize: 15, color: "var(--txt-2)", lineHeight: 1.7 }}>{deal.desc}</p>
                    </div>

                    {/* How to Claim */}
                    <div className="fade-up-1" style={{ background: "var(--card)", borderRadius: 20, padding: 28, marginBottom: 20, border: "1px solid var(--border)" }}>
                        <h2 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, marginBottom: 20, color: "var(--txt)" }}>How to Claim</h2>
                        {[
                            ["1", 'Click "Claim Offer"', "Opens the brand's student discount page in a new tab."],
                            ["2", `Verify via ${deal.verify}`, "Enter your university email or connect your student account."],
                            ["3", "Complete sign-up", "Create or log into your account with your student email."],
                            ["4", "Enjoy the discount", "Your discounted rate is applied automatically."],
                        ].map(([num, title, desc]) => (
                            <div key={num} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--lime)22", border: "1px solid var(--lime)44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--lime)", flexShrink: 0, marginTop: 2 }}>{num}</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--txt)", marginBottom: 3 }}>{title}</div>
                                    <div style={{ fontSize: 13, color: "var(--txt-2)" }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Conditions */}
                    <div className="fade-up-2" style={{ background: "var(--card)", borderRadius: 20, padding: 28, marginBottom: 20, border: "1px solid var(--border)" }}>
                        <h2 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, marginBottom: 16, color: "var(--txt)" }}>Conditions</h2>
                        {["Available to new subscribers only", "Must verify student status annually", "Cannot be combined with other offers", "UK only — see country breakdown below"].map((c, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                                <span style={{ color: "var(--txt-3)", fontSize: 14, marginTop: 1 }}>·</span>
                                <span style={{ fontSize: 14, color: "var(--txt-2)", lineHeight: 1.5 }}>{c}</span>
                            </div>
                        ))}
                    </div>

                    {/* Regions */}
                    <div className="fade-up-3" style={{ background: "var(--card)", borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
                        <h2 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, marginBottom: 16, color: "var(--txt)" }}>Region Availability</h2>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {REGIONS.slice(0, 5).map(r => (
                                <div key={r.code} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "var(--txt-2)" }}>
                                    <span>{r.flag}</span>
                                    <span style={{ fontWeight: 500 }}>{r.name}</span>
                                </div>
                            ))}
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--red)22", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "var(--red)", border: "1px solid var(--red)33" }}>
                                <span>🇩🇪</span> <span>Germany — Unavailable</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div style={{ position: "sticky", top: 76 }}>
                    {/* Claim Widget */}
                    <div className="fade-up" style={{ background: "var(--card)", borderRadius: 20, padding: 24, border: "1px solid var(--border-lit)", marginBottom: 16, animation: "pulse-lime 3s infinite" }}>
                        {/* Country switcher */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "var(--surface)", borderRadius: 10, padding: 4 }}>
                            {Object.entries(countryPrices).map(([code, v]) => (
                                <button key={code} onClick={() => setCountry(code)} style={{ flex: 1, border: "none", borderRadius: 8, padding: "6px 4px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: country === code ? "var(--card-hover)" : "none", color: country === code ? "var(--txt)" : "var(--txt-3)", transition: "all 0.2s", fontFamily: "var(--sans)" }}>
                                    {v.flag}
                                </button>
                            ))}
                        </div>

                        {geo.avail ? (
                            <>
                                <div style={{ marginBottom: 4 }}>
                                    <span style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 900, color: "var(--lime)" }}>{geo.price}</span>
                                </div>
                                <div style={{ fontSize: 13, color: "var(--txt-3)", marginBottom: 4 }}>
                                    <span style={{ textDecoration: "line-through" }}>{geo.original}</span> &nbsp; <span style={{ color: "var(--lime)", fontWeight: 700 }}>{deal.discount}</span>
                                </div>
                                <div style={{ fontSize: 12, color: "var(--txt-2)", marginBottom: 20 }}>{geo.label}</div>

                                <button style={{ width: "100%", background: "var(--lime)", color: "#000", border: "none", borderRadius: 14, padding: "14px 0", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "var(--sans)", marginBottom: 10, letterSpacing: 0.3, transition: "all 0.2s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#BEF264"}
                                    onMouseLeave={e => e.currentTarget.style.background = "var(--lime)"}>
                                    Claim Offer →
                                </button>
                                <div style={{ fontSize: 11, color: "var(--txt-3)", textAlign: "center" }}>Opens {deal.brand} student page</div>
                            </>
                        ) : (
                            <div style={{ textAlign: "center", padding: "12px 0" }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
                                <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 700, color: "var(--txt)", marginBottom: 6 }}>Not available in Germany</div>
                                <button onClick={() => setPage("location")} style={{ background: "var(--surface)", border: "1px solid var(--border-lit)", color: "var(--txt-2)", borderRadius: 12, padding: "10px 16px", fontSize: 13, cursor: "pointer", width: "100%", fontFamily: "var(--sans)" }}>
                                    Browse Deals in 🇩🇪 Germany
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Meta info */}
                    <div style={{ background: "var(--card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)", fontSize: 13, color: "var(--txt-2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><span>Verification</span><span style={{ color: "var(--txt)", fontWeight: 600 }}>{deal.verify}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><span>Expires</span><span style={{ color: "var(--txt)", fontWeight: 600 }}>{deal.expires}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>New customers</span><span style={{ color: deal.newOnly ? "var(--amber)" : "var(--lime)", fontWeight: 600 }}>{deal.newOnly ? "Required" : "No"}</span></div>
                        <div style={{ borderTop: "1px solid var(--border)", marginTop: 16, paddingTop: 16, display: "flex", gap: 8 }}>
                            <button onClick={() => setCopied(true)} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--txt-2)", borderRadius: 10, padding: "8px 0", fontSize: 12, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600 }}>
                                {copied ? "✓ Copied!" : "Copy Link"}
                            </button>
                            <button style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--txt-2)", borderRadius: 10, padding: "8px 0", fontSize: 12, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600 }}>
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar deals */}
            {similar.length > 0 && (
                <div style={{ marginTop: 48 }}>
                    <SectionTitle>Similar Deals</SectionTitle>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                        {similar.map(d => <DealCard key={d.id} deal={d} setPage={setPage} setSelected={setSelected} size="compact" />)}
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: BRAND
// ═══════════════════════════════════════════════════════════════════════════
const BrandPage = ({ setPage, setSelected }) => {
    const brand = BRANDS.spotify;
    const brandDeals = DEALS.filter(d => d.brandSlug === "spotify");

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
            <BackBtn onClick={() => setPage("browse")} />

            {/* Hero */}
            <div className="fade-up" style={{ background: "var(--card)", borderRadius: 24, padding: 0, border: "1px solid var(--border)", marginBottom: 24, overflow: "hidden" }}>
                <div style={{ height: 140, background: "linear-gradient(135deg, #1DB95422, #1DB95488, transparent)", borderBottom: "1px solid var(--border)", position: "relative", display: "flex", alignItems: "flex-end", padding: "0 28px 0" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "radial-gradient(circle at 80% 50%, #1DB95430 0%, transparent 60%)" }} />
                </div>
                <div style={{ padding: "0 28px 28px", marginTop: -32, position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 16 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#1DB95422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, border: "3px solid var(--card)", boxShadow: "0 0 0 1px #1DB95444" }}>
                            {brand.logo}🟢
                        </div>
                        <div style={{ paddingBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--txt)" }}>{brand.name}</h1>
                                <span style={{ fontSize: 12, background: "var(--lime)22", color: "var(--lime)", border: "1px solid var(--lime)33", borderRadius: 20, padding: "2px 9px", fontWeight: 600 }}>✓ Verified Brand</span>
                            </div>
                            <p style={{ fontSize: 14, color: "var(--txt-2)", marginTop: 2 }}>{brand.tagline} · {brand.website}</p>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
                        {[["🎁", brand.deals + " deals", "available"], ["🖱️", brand.clicks, "clicks this month"], ["🌐", brand.website, "official site"]].map(([ic, v, l]) => (
                            <div key={l} style={{ background: "var(--surface)", borderRadius: 12, padding: "14px 16px" }}>
                                <div style={{ fontSize: 20, marginBottom: 6 }}>{ic}</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--txt)", fontFamily: "var(--serif)" }}>{v}</div>
                                <div style={{ fontSize: 11, color: "var(--txt-3)" }}>{l}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: 14, color: "var(--txt-2)", lineHeight: 1.7, marginBottom: 12 }}>{brand.desc}</p>
                    <div style={{ fontSize: 13, color: "var(--txt-2)", background: "var(--lime)11", border: "1px solid var(--lime)22", borderRadius: 10, padding: "10px 14px" }}>
                        💚 <strong style={{ color: "var(--lime)" }}>Why we love it:</strong> {brand.love}
                    </div>
                </div>
            </div>

            {/* Deals */}
            <div className="fade-up-1">
                <SectionTitle>Student Deals from Spotify</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 40 }}>
                    {(brandDeals.length ? brandDeals : DEALS.slice(0, 3)).map(d => (
                        <DealCard key={d.id} deal={d} setPage={setPage} setSelected={setSelected} />
                    ))}
                </div>
            </div>

            {/* FAQs */}
            <div className="fade-up-2" style={{ marginBottom: 40 }}>
                <SectionTitle>Frequently Asked Questions</SectionTitle>
                {[
                    ["How do I verify my student status?", "You verify through SheerID. Enter your university email address (.ac.uk or .edu) and they confirm your enrollment in real time. It takes about 30 seconds."],
                    ["Can I use this with a free Spotify account?", "Yes — you can upgrade your existing free account. You don't need to create a new account."],
                    ["Does the discount renew automatically?", "No. You'll need to re-verify your student status each year. Spotify sends a reminder email before your discount expires."],
                    ["Is this available outside the UK?", "Yes — Spotify offers student discounts in 30+ countries. The price varies by region. Use the country selector on the deal page to see local pricing."],
                ].map(([q, a], i) => <FAQ key={i} q={q} a={a} />)}
            </div>

            {/* Compare */}
            <div className="fade-up-3">
                <SectionTitle sub="See how Spotify compares to other student music deals">Compare Spotify With</SectionTitle>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {["Spotify vs Apple Music", "Spotify vs YouTube Music", "Spotify vs Amazon Music"].map(t => (
                        <button key={t} onClick={() => setPage("compare")} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--txt-2)", borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--lime)"; e.currentTarget.style.color = "var(--lime)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--txt-2)"; }}>
                            {t} →
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FAQ = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
            <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", textAlign: "left", gap: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)", fontFamily: "var(--sans)" }}>{q}</span>
                <span style={{ color: "var(--txt-3)", fontSize: 16, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
            </button>
            {open && <p style={{ fontSize: 14, color: "var(--txt-2)", lineHeight: 1.7, paddingBottom: 18 }}>{a}</p>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: CATEGORY pSEO
// ═══════════════════════════════════════════════════════════════════════════
const CategoryPage = ({ setPage, setSelected }) => {
    const cat = CATEGORIES[0]; // Tech & Software
    const deals = DEALS.filter(d => d.categorySlug === "tech-software");

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
            <BackBtn onClick={() => setPage("browse")} />

            {/* Hero */}
            <div className="fade-up" style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "#3B82F622", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: "1px solid #3B82F644" }}>
                        {cat.icon}
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: "var(--txt-3)", fontWeight: 600, letterSpacing: 0.8, marginBottom: 4 }}>STUDENT DISCOUNTS</div>
                        <h1 style={{ fontFamily: "var(--serif)", fontSize: 40, fontWeight: 900, color: "var(--txt)", lineHeight: 1 }}>{cat.name}</h1>
                    </div>
                </div>
                <p style={{ fontSize: 16, color: "var(--txt-2)", maxWidth: 540, lineHeight: 1.7 }}>
                    Save big on apps, tools and subscriptions. All verified for students in 2025.
                </p>
            </div>

            {/* Stats */}
            <div className="fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 40 }}>
                {[["48", "deals available"], ["Up to 100%", "maximum discount"], ["1 min", "average verification"]].map(([v, l]) => (
                    <div key={l} style={{ background: "var(--card)", borderRadius: 16, padding: "20px 24px", border: "1px solid var(--border)" }}>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 700, color: "var(--lime)", marginBottom: 4 }}>{v}</div>
                        <div style={{ fontSize: 13, color: "var(--txt-2)" }}>{l}</div>
                    </div>
                ))}
            </div>

            {/* Region filter */}
            <div className="fade-up-2" style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, color: "var(--txt-3)", fontWeight: 600, letterSpacing: 0.8, marginBottom: 10 }}>FILTER BY REGION</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {REGIONS.map(r => (
                        <Pill key={r.code} label={`${r.flag} ${r.name}`} active={r.code === "gb"} onClick={() => { }} />
                    ))}
                </div>
            </div>

            {/* Deals */}
            <div className="fade-up-3" style={{ marginBottom: 48 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {(deals.length ? deals : DEALS.slice(0, 4)).map(d => (
                        <DealCard key={d.id} deal={d} setPage={setPage} setSelected={setSelected} />
                    ))}
                </div>
            </div>

            {/* SEO Content */}
            <div className="fade-up-4" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, marginBottom: 48 }}>
                <div style={{ background: "var(--card)", borderRadius: 20, padding: 32, border: "1px solid var(--border)" }}>
                    <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 700, marginBottom: 20, color: "var(--txt)" }}>
                        How to Get Student Tech Discounts in 2025
                    </h2>
                    {[
                        ["Get your university email", "You'll need a .ac.uk, .edu or .university email to verify. If you don't have one yet, contact your university IT department."],
                        ["Sign up to UNiDAYS or Student Beans", "These platforms verify your student status once, and you can then use them across hundreds of brands."],
                        ["Claim directly via SheerID", "Many tech brands use SheerID for instant verification. You enter your email and they confirm with your university in real time."],
                        ["Stack your discounts", "The GitHub Student Pack includes credits for AWS, DigitalOcean, and more — maximise what you claim in one go."],
                    ].map(([t, d], i) => (
                        <div key={i} style={{ marginBottom: 20 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--txt)", marginBottom: 4 }}>{i + 1}. {t}</div>
                            <div style={{ fontSize: 14, color: "var(--txt-2)", lineHeight: 1.7 }}>{d}</div>
                        </div>
                    ))}
                </div>
                <div>
                    <div style={{ background: "var(--card)", borderRadius: 20, padding: 24, border: "1px solid var(--border)", marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-3)", marginBottom: 12, letterSpacing: 0.6 }}>EXPLORE BY REGION</div>
                        {REGIONS.slice(0, 5).map(r => (
                            <button key={r.code} onClick={() => setPage("location")} style={{ display: "flex", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--txt-2)", fontFamily: "var(--sans)" }}
                                onMouseEnter={e => e.currentTarget.style.color = "var(--lime)"}
                                onMouseLeave={e => e.currentTarget.style.color = "var(--txt-2)"}>
                                <span>{r.flag} {r.name}</span>
                                <span style={{ color: "var(--txt-3)" }}>{r.count} deals →</span>
                            </button>
                        ))}
                    </div>
                    <div style={{ background: "var(--card)", borderRadius: 20, padding: 24, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-3)", marginBottom: 12, letterSpacing: 0.6 }}>RELATED CATEGORIES</div>
                        {CATEGORIES.slice(1, 5).map(c => (
                            <div key={c.slug} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}>
                                <span>{c.icon}</span>
                                <span style={{ fontSize: 14, color: "var(--txt-2)" }}>{c.name}</span>
                                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--txt-3)" }}>{c.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: LOCATION pSEO
// ═══════════════════════════════════════════════════════════════════════════
const LocationPage = ({ setPage, setSelected }) => {
    const region = REGIONS[0]; // UK
    const [selCat, setSelCat] = useState("All");

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
            <BackBtn onClick={() => setPage("browse")} />

            {/* Hero */}
            <div className="fade-up" style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--txt-3)", marginBottom: 12, fontWeight: 500 }}>
                    Student Discounts <span style={{ margin: "0 4px" }}>›</span> {region.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 52 }}>{region.flag}</span>
                    <div>
                        <h1 style={{ fontFamily: "var(--serif)", fontSize: 40, fontWeight: 900, color: "var(--txt)", lineHeight: 1.1 }}>
                            Student Deals in<br />{region.name}
                        </h1>
                        <p style={{ fontSize: 14, color: "var(--txt-2)", marginTop: 8 }}>
                            {region.count} verified deals available to UK university students right now.
                        </p>
                    </div>
                </div>
            </div>

            {/* Category filter */}
            <div className="fade-up-1" style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Pill label="All" active={selCat === "All"} onClick={() => setSelCat("All")} />
                    {CATEGORIES.map(c => <Pill key={c.slug} label={`${c.icon} ${c.name}`} active={selCat === c.slug} onClick={() => setSelCat(c.slug)} />)}
                </div>
            </div>

            {/* Exclusive badge strip */}
            <div className="fade-up-2" style={{ background: "linear-gradient(90deg, var(--lime)22, var(--lime)11)", border: "1px solid var(--lime)33", borderRadius: 14, padding: "14px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>🇬🇧</span>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--lime)" }}>UK-Exclusive Deals</div>
                    <div style={{ fontSize: 12, color: "var(--txt-2)" }}>These deals are only available to students in the United Kingdom</div>
                </div>
            </div>

            {/* Featured deals */}
            <div className="fade-up-3" style={{ marginBottom: 40 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {DEALS.slice(0, 6).map(d => (
                        <DealCard key={d.id} deal={d} setPage={setPage} setSelected={setSelected} />
                    ))}
                </div>
            </div>

            {/* Category cards linking to cat+location combos */}
            <div className="fade-up-4">
                <SectionTitle sub={`Browse ${region.name} deals by category`}>Explore by Category in the UK</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                    {CATEGORIES.map(c => (
                        <button key={c.slug} onClick={() => setPage("category")} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px", textAlign: "left", cursor: "pointer", fontFamily: "var(--sans)", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-lit)"; e.currentTarget.style.background = "var(--card-hover)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--card)"; }}>
                            <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--txt)", marginBottom: 4 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: "var(--txt-3)" }}>{c.count} deals in UK →</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Other regions */}
            <div style={{ marginTop: 48 }}>
                <SectionTitle sub="Student deals in other countries">Other Regions</SectionTitle>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {REGIONS.filter(r => r.code !== "gb").map(r => (
                        <button key={r.code} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--txt-2)", borderRadius: 12, padding: "10px 18px", fontSize: 14, cursor: "pointer", fontFamily: "var(--sans)", display: "flex", gap: 8, alignItems: "center" }}>
                            {r.flag} {r.name} <span style={{ color: "var(--txt-3)", fontSize: 12 }}>{r.count}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: COMPARE
// ═══════════════════════════════════════════════════════════════════════════
const ComparePage = ({ setPage, setSelected }) => {
    const a = { name: "Spotify", logo: "🟢", color: "#1DB954", price: "£4.99/mo", orig: "£9.99/mo", disc: "50% OFF", verify: "SheerID", renew: "Annual" };
    const b = { name: "Apple Music", logo: "🍎", color: "#FC3C44", price: "£5.99/mo", orig: "£10.99/mo", disc: "46% OFF", verify: "UNiDAYS", renew: "Annual" };

    const rows = [
        ["Offline downloads", true, true],
        ["Spatial Audio", false, true],
        ["Podcast library", true, false],
        ["Duo/Family plans", true, true],
        ["Platform", "All platforms", "Best on Apple"],
        ["Music library", "100M tracks", "100M tracks"],
        ["Hulu bundle (US)", true, false],
        ["Android app", true, "Limited"],
        ["Price after student", "£9.99/mo", "£10.99/mo"],
    ];

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
            <BackBtn onClick={() => setPage("browse")} />

            <div className="fade-up" style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, color: "var(--txt-3)", fontWeight: 600, letterSpacing: 0.8, marginBottom: 8 }}>COMPARISON · MUSIC STREAMING</div>
                <h1 style={{ fontFamily: "var(--serif)", fontSize: 40, fontWeight: 900, color: "var(--txt)", lineHeight: 1.1, marginBottom: 8 }}>
                    {a.name} vs {b.name}
                </h1>
                <p style={{ fontSize: 14, color: "var(--txt-2)" }}>Student Discount Comparison — Updated March 2025</p>
            </div>

            {/* Hero comparison row */}
            <div className="fade-up-1" style={{ display: "grid", gridTemplateColumns: "1fr 48px 1fr", gap: 0, marginBottom: 32, alignItems: "stretch" }}>
                {[a, b].map((s, idx) => (
                    <>
                        {idx === 1 && <div key="vs" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "var(--txt-3)" }}>VS</div>
                        </div>}
                        <div key={s.name} style={{ background: "var(--card)", border: `2px solid ${s.color}44`, borderRadius: 20, padding: 28, textAlign: "center" }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", border: `1px solid ${s.color}44` }}>{s.logo}</div>
                            <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--txt)", marginBottom: 4 }}>{s.name}</div>
                            <div style={{ marginBottom: 8 }}>
                                <span style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 900, color: s.color }}>{s.price}</span>
                            </div>
                            <div style={{ fontSize: 13, color: "var(--txt-3)", marginBottom: 16 }}>
                                <span style={{ textDecoration: "line-through" }}>{s.orig}</span> &nbsp;
                                <span style={{ fontWeight: 700, color: "var(--lime)" }}>{s.disc}</span>
                            </div>
                            <button style={{ background: s.color, color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "var(--sans)" }}>
                                Claim {s.name} →
                            </button>
                            <div style={{ marginTop: 12, fontSize: 12, color: "var(--txt-3)" }}>via {s.verify}</div>
                        </div>
                    </>
                ))}
            </div>

            {/* Feature table */}
            <div className="fade-up-2" style={{ background: "var(--card)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 32 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--txt-3)", letterSpacing: 0.8 }}>FEATURE</div>
                    <div style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "var(--txt)", borderLeft: "1px solid var(--border)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{a.logo} {a.name}</div>
                    <div style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "var(--txt)", borderLeft: "1px solid var(--border)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{b.logo} {b.name}</div>
                </div>
                {rows.map(([feat, av, bv], i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ padding: "14px 20px", fontSize: 13, color: "var(--txt-2)" }}>{feat}</div>
                        <CellValue val={av} color={a.color} />
                        <CellValue val={bv} color={b.color} border />
                    </div>
                ))}
            </div>

            {/* Verdict */}
            <div className="fade-up-3" style={{ background: "linear-gradient(135deg, var(--lime)18, var(--lime)08)", border: "1px solid var(--lime)33", borderRadius: 20, padding: 28, marginBottom: 40 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--lime)", letterSpacing: 0.8, marginBottom: 8 }}>🏆 OUR VERDICT</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--txt)", marginBottom: 10 }}>
                    Spotify wins for most students
                </div>
                <p style={{ fontSize: 14, color: "var(--txt-2)", lineHeight: 1.7 }}>
                    Spotify's student deal is cheaper, available on all platforms, and includes a Hulu bundle in the US.
                    Apple Music is worth it if you're deep in the Apple ecosystem and care about Spatial Audio.
                    For most students on a budget, Spotify at £4.99/mo is the smarter pick.
                </p>
            </div>

            {/* Related comparisons */}
            <SectionTitle>Related Comparisons</SectionTitle>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["Spotify vs YouTube Music", "Apple Music vs Tidal", "Spotify vs Deezer", "Apple Music vs Amazon Music"].map(t => (
                    <button key={t} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--txt-2)", borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)" }}>
                        {t} →
                    </button>
                ))}
            </div>
        </div>
    );
};

const CellValue = ({ val, color, border }) => {
    const style = { padding: "14px 20px", fontSize: 13, textAlign: "center", borderLeft: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" };
    if (val === true) return <div style={style}><span style={{ color: "var(--lime)", fontSize: 16 }}>✓</span></div>;
    if (val === false) return <div style={style}><span style={{ color: "var(--txt-3)", fontSize: 16 }}>✗</span></div>;
    return <div style={{ ...style, color: "var(--txt-2)" }}>{val}</div>;
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: PERSONA
// ═══════════════════════════════════════════════════════════════════════════
const PersonaPage = ({ setPage, setSelected }) => {
    const persona = { icon: "👨‍💻", title: "CS Students", subtitle: "The Developer Stack", desc: "Every tool a computer science student actually needs — with every discount they're entitled to. Stack these and you'll save over £500 in your first year alone." };
    const essentials = DEALS.filter(d => d.tag === "Essential" || d.category === "Tech & Software").slice(0, 4);
    const also = DEALS.filter(d => d.category !== "Tech & Software").slice(0, 4);

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
            <BackBtn onClick={() => setPage("browse")} />

            {/* Hero */}
            <div className="fade-up" style={{ background: "var(--card)", borderRadius: 24, padding: 40, border: "1px solid var(--border)", marginBottom: 40, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -40, right: -40, fontSize: 160, opacity: 0.06, userSelect: "none" }}>{persona.icon}</div>
                <div style={{ position: "relative" }}>
                    <div style={{ fontSize: 12, color: "var(--txt-3)", fontWeight: 600, letterSpacing: 0.8, marginBottom: 12 }}>STUDENT DEAL STACK</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                        <span style={{ fontSize: 48 }}>{persona.icon}</span>
                        <div>
                            <h1 style={{ fontFamily: "var(--serif)", fontSize: 40, fontWeight: 900, color: "var(--txt)", lineHeight: 1 }}>{persona.title}</h1>
                            <div style={{ fontSize: 16, color: "var(--lime)", fontWeight: 600, marginTop: 4 }}>{persona.subtitle}</div>
                        </div>
                    </div>
                    <p style={{ fontSize: 15, color: "var(--txt-2)", lineHeight: 1.7, maxWidth: 600 }}>{persona.desc}</p>
                </div>
            </div>

            {/* Savings calculator */}
            <div className="fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 40 }}>
                {[["£500+", "saved per year"], ["8", "essential tools"], ["FREE", "to verify"]].map(([v, l]) => (
                    <div key={l} style={{ background: "var(--card)", borderRadius: 16, padding: "24px", border: "1px solid var(--border)", textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 900, color: "var(--lime)", marginBottom: 4 }}>{v}</div>
                        <div style={{ fontSize: 13, color: "var(--txt-2)" }}>{l}</div>
                    </div>
                ))}
            </div>

            {/* Must-haves */}
            <div className="fade-up-2" style={{ marginBottom: 48 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--lime)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>★</div>
                    <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 700, color: "var(--txt)" }}>Must-Have Tools</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {(essentials.length ? essentials : DEALS.slice(0, 4)).map(d => (
                        <div key={d.id} style={{ position: "relative" }}>
                            <div style={{ position: "absolute", top: -8, left: 16, background: "var(--lime)", color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, zIndex: 1, letterSpacing: 0.8 }}>ESSENTIAL</div>
                            <DealCard deal={d} setPage={setPage} setSelected={setSelected} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Also recommended */}
            <div className="fade-up-3" style={{ marginBottom: 48 }}>
                <SectionTitle sub="Deals other CS students also love">Also Recommended</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                    {(also.length ? also : DEALS.slice(4, 8)).map(d => (
                        <DealCard key={d.id} deal={d} setPage={setPage} setSelected={setSelected} size="compact" />
                    ))}
                </div>
            </div>

            {/* Other personas */}
            <div className="fade-up-4">
                <SectionTitle>Other Student Profiles</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                    {PERSONAS.filter(p => p.slug !== "cs-students").map(p => (
                        <button key={p.slug} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px", textAlign: "left", cursor: "pointer", fontFamily: "var(--sans)", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-lit)"; e.currentTarget.style.background = "var(--card-hover)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--card)"; }}>
                            <div style={{ fontSize: 32, marginBottom: 10 }}>{p.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--txt)", marginBottom: 2 }}>{p.title}</div>
                            <div style={{ fontSize: 12, color: "var(--txt-3)" }}>{p.subtitle} →</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: SUBSCRIBE CONFIRM
// ═══════════════════════════════════════════════════════════════════════════
const SubscribeConfirmPage = ({ setPage }) => (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="fade-up" style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--lime)22", border: "2px solid var(--lime)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px", animation: "pulse-lime 2s infinite" }}>
                ✓
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 38, fontWeight: 900, color: "var(--txt)", marginBottom: 12 }}>You're in!</h1>
            <p style={{ fontSize: 16, color: "var(--txt-2)", lineHeight: 1.7, marginBottom: 32 }}>
                Your email is confirmed. You'll get the best student deals every week — straight to your inbox. No spam, unsubscribe anytime.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button onClick={() => setPage("browse")} style={{ background: "var(--lime)", color: "#000", border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "var(--sans)" }}>
                    Browse Deals Now →
                </button>
                <button style={{ background: "none", border: "none", color: "var(--txt-3)", fontSize: 13, cursor: "pointer", fontFamily: "var(--sans)" }}>
                    Unsubscribe instead
                </button>
            </div>

            {/* Preview this week's deals */}
            <div style={{ marginTop: 48, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--txt-3)", letterSpacing: 0.8, marginBottom: 16 }}>THIS WEEK'S HIGHLIGHTS</div>
                {DEALS.slice(0, 3).map(d => (
                    <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ fontSize: 24 }}>{d.logo}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>{d.brand} — {d.title}</div>
                            <div style={{ fontSize: 12, color: "var(--txt-3)" }}>{d.category}</div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--lime)" }}>{d.discount}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════
const Footer = ({ setPage }) => (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: 80, padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
                <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--lime)", marginBottom: 8 }}>UniPerks</div>
                    <p style={{ fontSize: 13, color: "var(--txt-3)", lineHeight: 1.7, maxWidth: 260 }}>Every verified student discount in one place. No sign-up needed. Updated daily.</p>
                </div>
                {[
                    ["Discover", ["Browse Deals", "Categories", "By Region", "For Students"]],
                    ["Compare", ["Spotify vs Apple", "Adobe vs Canva", "Notion vs Obsidian"]],
                    ["Company", ["About", "Privacy", "Terms", "Sitemap"]],
                ].map(([title, links]) => (
                    <div key={title}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--txt-3)", letterSpacing: 0.8, marginBottom: 12 }}>{title.toUpperCase()}</div>
                        {links.map(l => <div key={l} style={{ fontSize: 13, color: "var(--txt-2)", marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
                    </div>
                ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--txt-3)" }}>
                <span>© 2025 UniPerks · Built for students</span>
                <span>Affiliate disclosure: We earn commissions when you claim deals. Prices may vary.</span>
            </div>
        </div>
    </footer>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function UniPerksApp() {
    const [page, setPage] = useState("browse");
    const [selected, setSelected] = useState("spotify-premium-student");
    const containerRef = useRef(null);

    useEffect(() => { containerRef.current?.scrollTo(0, 0); }, [page]);

    const pages = {
        browse: <BrowsePage setPage={setPage} setSelected={setSelected} />,
        deal: <DealDetailPage slug={selected} setPage={setPage} setSelected={setSelected} />,
        brand: <BrandPage setPage={setPage} setSelected={setSelected} />,
        category: <CategoryPage setPage={setPage} setSelected={setSelected} />,
        location: <LocationPage setPage={setPage} setSelected={setSelected} />,
        compare: <ComparePage setPage={setPage} setSelected={setSelected} />,
        persona: <PersonaPage setPage={setPage} setSelected={setSelected} />,
        confirm: <SubscribeConfirmPage setPage={setPage} />,
    };

    return (
        <>
            <FontLink />
            <div ref={containerRef} style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--txt)", fontFamily: "var(--sans)", overflowX: "hidden" }}>
                <Ticker />
                <Nav page={page} setPage={setPage} />

                {/* Page nav pills */}
                <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "8px 24px", display: "flex", gap: 8, overflowX: "auto" }}>
                    {[
                        ["browse", "Browse"],
                        ["deal", "Deal Detail"],
                        ["brand", "Brand Page"],
                        ["category", "Category pSEO"],
                        ["location", "Location pSEO"],
                        ["compare", "Compare"],
                        ["persona", "Persona"],
                        ["confirm", "Subscribe ✓"],
                    ].map(([p, l]) => (
                        <button key={p} onClick={() => setPage(p)} style={{ background: page === p ? "var(--lime)" : "transparent", color: page === p ? "#000" : "var(--txt-3)", border: `1px solid ${page === p ? "var(--lime)" : "var(--border)"}`, borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--sans)", letterSpacing: 0.3 }}>
                            {l}
                        </button>
                    ))}
                </div>

                <main>
                    {pages[page] || pages.browse}
                </main>

                {page !== "confirm" && <Footer setPage={setPage} />}
            </div>
        </>
    );
}
