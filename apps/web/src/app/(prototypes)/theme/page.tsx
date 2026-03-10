"use client"


import { useState, useRef, useEffect } from "react";
import { WordRotate } from "@/components/word-rotate";

/* ─── UTILS ───────────────────────────────────────────────────── */
function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
}

/* ─── DATA ────────────────────────────────────────────────────── */
const DEALS = [
    { id: 1, store: "Gymshark", category: "Fashion", discount: "15%", label: "Student Discount Sitewide", sub: "Fashion · Online", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80", tag: "SPONSORED", saves: "Up to £30", expires: "Ongoing", featured: true },
    { id: 2, store: "Spotify", category: "Entertainment", discount: "50%", label: "Premium Student Plan", sub: "Music · Online", img: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80", tag: "VERIFIED", saves: "£5.99/mo", expires: "Ongoing", featured: true },
    { id: 3, store: "ASOS", category: "Fashion", discount: "10%", label: "Student Discount on Everything", sub: "Fashion · Online", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", tag: "HOT", saves: "Up to £40", expires: "No expiry", featured: true },
    { id: 4, store: "Apple", category: "Tech", discount: "£150", label: "Education Pricing on Mac & iPad", sub: "Tech · In-store", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80", tag: "EXCLUSIVE", saves: "£150–300", expires: "Sep 30", featured: true },
    { id: 5, store: "Adobe", category: "Tech", discount: "60%", label: "Creative Cloud All Apps", sub: "Software · Online", img: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&q=80", tag: "VERIFIED", saves: "£30/mo", expires: "Ongoing", featured: true },
    { id: 6, store: "Railcard", category: "Travel", discount: "30%", label: "16-25 Railcard Annual Pass", sub: "Travel · UK-wide", img: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80", tag: "POPULAR", saves: "Avg £84/yr", expires: "1 year", featured: true },
    { id: 7, store: "Amazon", category: "Lifestyle", discount: "FREE", label: "Prime Student 6-Month Trial", sub: "Shopping · Online", img: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&q=80", tag: "HOT", saves: "£4.99/mo", expires: "Limited", featured: false },
    { id: 8, store: "Deliveroo", category: "Food", discount: "FREE", label: "Plus Membership 3-Month Trial", sub: "Food · Online", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80", tag: "NEW", saves: "£8.99/mo", expires: "Limited", featured: false },
    { id: 9, store: "Notion", category: "Tech", discount: "FREE", label: "Plus Plan Free for Students", sub: "Productivity · App", img: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80", tag: "FREE", saves: "£8/mo", expires: "Ongoing", featured: false },
    { id: 10, store: "Nike", category: "Fashion", discount: "20%", label: "Student Exclusive on All Styles", sub: "Fashion · Online", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", tag: "TRENDING", saves: "Up to £60", expires: "Ongoing", featured: false },
    { id: 11, store: "Headspace", category: "Health", discount: "85%", label: "Annual Meditation Plan", sub: "Wellness · App", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80", tag: "EXCLUSIVE", saves: "£9.99/mo", expires: "Ongoing", featured: false },
    { id: 12, store: "Grammarly", category: "Tech", discount: "20%", label: "Premium Writing Assistant", sub: "Writing · Online", img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80", tag: "VERIFIED", saves: "£10/mo", expires: "Ongoing", featured: false },
    { id: 13, store: "Netflix", category: "Entertainment", discount: "FREE", label: "Student Netflix Free Trial", sub: "Streaming · Online", img: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80", tag: "HOT", saves: "£4.99/mo", expires: "30 days", featured: false },
    { id: 14, store: "Unidays", category: "Lifestyle", discount: "25%", label: "Hundreds of Brand Deals Unlocked", sub: "Multi-brand · Online", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80", tag: "VERIFIED", saves: "Varies", expires: "Ongoing", featured: false },
    { id: 15, store: "Uber Eats", category: "Food", discount: "50%", label: "50% Off First 3 Orders", sub: "Food · Online", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", tag: "NEW", saves: "Up to £15", expires: "Limited", featured: false },
    { id: 16, store: "Duolingo", category: "Health", discount: "FREE", label: "Duolingo Plus for Students", sub: "Education · App", img: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80", tag: "FREE", saves: "£6.99/mo", expires: "Ongoing", featured: false },
];

const CATEGORIES = ["Fashion", "Tech", "Entertainment", "Travel", "Food", "Health", "Lifestyle"];
const CAT_ICONS = { Fashion: "👗", Tech: "💻", Entertainment: "🎵", Travel: "✈️", Food: "🍔", Health: "🧘", Lifestyle: "🛍️" };

const TAG_COLORS = {
    HOT: "#FF3B30", NEW: "#34C759", EXCLUSIVE: "#AF52DE",
    VERIFIED: "#007AFF", POPULAR: "#FF9500", TRENDING: "#FF2D55",
    FREE: "#00C7BE", SPONSORED: "#888888",
};

const PLACEHOLDERS = [
    "Search student deals...", "Find discounts on tech...", "Explore fashion deals...",
    "Save on food delivery...", "Discover travel offers...", "Get software for free...",
];

const FOOTER_LINKS = {
    "Explore": ["All Deals", "Featured", "New Arrivals", "Expiring Soon", "Free Deals", "Student Picks"],
    "Categories": ["Fashion", "Tech & Software", "Food & Drink", "Travel", "Entertainment", "Health & Wellness"],
    "Students": ["How It Works", "Verify Student Status", "Submit a Deal", "Student Blog", "University Hubs", "Partner With Us"],
    "Company": ["About DealScout", "Press & Media", "Careers", "Privacy Policy", "Terms of Service", "Contact Us"],
};

const THEMES = [
    { color: "#00C48C", name: "Emerald" },
    { color: "#FF4820", name: "Ember" },
    { color: "#0066FF", name: "Cobalt" },
    { color: "#FF2D78", name: "Fuchsia" },
    { color: "#FF9F0A", name: "Amber" },
    { color: "#BF5AF2", name: "Violet" },
];

/* ─── TYPEWRITER ──────────────────────────────────────────────── */
function useTypewriter(list) {
    const [idx, setIdx] = useState(0);
    const [txt, setTxt] = useState("");
    const [del, setDel] = useState(false);
    useEffect(() => {
        const target = list[idx];
        let t;
        if (!del && txt.length < target.length) t = setTimeout(() => setTxt(target.slice(0, txt.length + 1)), 55);
        else if (!del && txt.length === target.length) t = setTimeout(() => setDel(true), 2200);
        else if (del && txt.length > 0) t = setTimeout(() => setTxt(txt.slice(0, -1)), 28);
        else { setDel(false); setIdx(i => (i + 1) % list.length); }
        return () => clearTimeout(t);
    }, [txt, del, idx, list]);
    return txt;
}

/* ─── DEAL CARD ───────────────────────────────────────────────── */
function DealCard({ deal, accent, dark }) {
    const [hov, setHov] = useState(false);
    const bg = dark ? "#16161E" : "#FFFFFF";
    const tx = dark ? "#F0EEE8" : "#111118";
    const mu = dark ? "rgba(240,238,232,0.4)" : "rgba(17,17,24,0.4)";
    const bd = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    const tagC = TAG_COLORS[deal.tag] || "#888";

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flexShrink: 0, width: 224,
                background: bg,
                border: `1.5px solid ${hov ? accent : bd}`,
                outline: hov ? `1px solid ${accent}` : "none",
                boxShadow: hov ? `4px 4px 0 ${accent}` : "none",
                transition: "all 0.18s",
                cursor: "pointer",
            }}
        >
            <div style={{ position: "relative", height: 156, overflow: "hidden" }}>
                <img src={deal.img} alt={deal.store} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hov ? "scale(1.07)" : "scale(1)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.55) 100%)" }} />
                <div style={{ position: "absolute", top: 10, left: 10, background: accent, color: "#fff", fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: "0.04em", padding: "2px 10px" }}>
                    {deal.discount}{deal.discount !== "FREE" ? " OFF" : ""}
                </div>
                <div style={{ position: "absolute", top: 10, right: 10, background: tagC, color: "#fff", fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", padding: "3px 7px", textTransform: "uppercase" }}>
                    {deal.tag}
                </div>
                <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(255,255,255,0.93)", padding: "3px 9px", fontSize: 11, fontWeight: 800, color: "#111" }}>
                    {deal.store}
                </div>
            </div>
            <div style={{ padding: "12px 12px 10px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: tx, lineHeight: 1.35, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Syne',sans-serif" }}>
                    {deal.label}
                </div>
                <div style={{ fontSize: 10, color: mu, marginBottom: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.02em" }}>{deal.sub}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <span style={{ fontSize: 9, color: mu, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono',monospace" }}>SAVE </span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: accent, fontFamily: "'JetBrains Mono',monospace" }}>{deal.saves}</span>
                    </div>
                    <div style={{ padding: "5px 12px", background: hov ? accent : "transparent", border: `1.5px solid ${hov ? accent : bd}`, color: hov ? "#fff" : mu, fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", transition: "all 0.18s" }}>
                        GET →
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── WIDE FEATURED CARD (carousel — spans 2 card widths) ─────── */
function WideCard({ deal, accent }) {
    const [hov, setHov] = useState(false);
    const tagC = TAG_COLORS[deal.tag] || "#888";

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flexShrink: 0, width: 462,
                position: "relative", overflow: "hidden", cursor: "pointer",
                border: `2px solid ${hov ? accent : "transparent"}`,
                boxShadow: hov ? `6px 6px 0 ${accent}` : "2px 2px 0 rgba(0,0,0,0.3)",
                transition: "all 0.2s",
            }}
        >
            <img src={deal.img} alt={deal.store} style={{ width: "100%", height: 300, objectFit: "cover", display: "block", transition: "transform 0.45s", transform: hov ? "scale(1.05)" : "scale(1)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.15) 55%,transparent 100%)" }} />
            <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ background: accent, color: "#fff", fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: "0.04em", padding: "3px 14px" }}>
                    {deal.discount}{deal.discount !== "FREE" ? " OFF" : ""}
                </div>
                <div style={{ background: tagC, color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", padding: "5px 10px", textTransform: "uppercase" }}>
                    {deal.tag}
                </div>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ background: "rgba(255,255,255,0.95)", padding: "3px 10px", fontSize: 12, fontWeight: 800, color: "#111" }}>{deal.store}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>{deal.category}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 12, fontFamily: "'Syne',sans-serif" }}>{deal.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em" }}>SAVE </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: accent, fontFamily: "'JetBrains Mono',monospace" }}>{deal.saves}</span>
                    </div>
                    <div style={{ padding: "9px 20px", background: hov ? accent : "rgba(255,255,255,0.12)", color: "#fff", fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", border: "1.5px solid rgba(255,255,255,0.25)", transition: "all 0.18s" }}>
                        GET DEAL →
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── TOP PICKS CARD (4-card row) ─────────────────────────────── */
function FeatCard({ deal, accent, dark }) {
    const [hov, setHov] = useState(false);
    const bg = dark ? "#16161E" : "#FFFFFF";
    const tx = dark ? "#F0EEE8" : "#111118";
    const mu = dark ? "rgba(240,238,232,0.4)" : "rgba(17,17,24,0.4)";
    const bd = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    const tagC = TAG_COLORS[deal.tag] || "#888";

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flex: 1, minWidth: 0,
                background: bg,
                border: `1.5px solid ${hov ? accent : bd}`,
                boxShadow: hov ? `4px 4px 0 ${accent}` : "none",
                transition: "all 0.18s", cursor: "pointer", overflow: "hidden",
            }}
        >
            <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
                <img src={deal.img} alt={deal.store} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hov ? "scale(1.06)" : "scale(1)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.55) 100%)" }} />
                <div style={{ position: "absolute", top: 12, left: 12, background: accent, color: "#fff", fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: "0.04em", padding: "3px 12px" }}>
                    {deal.discount}{deal.discount !== "FREE" ? " OFF" : ""}
                </div>
                <div style={{ position: "absolute", top: 12, right: 12, background: tagC, color: "#fff", fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", padding: "3px 8px", textTransform: "uppercase" }}>
                    {deal.tag}
                </div>
                <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(255,255,255,0.93)", padding: "3px 10px", fontSize: 12, fontWeight: 800, color: "#111" }}>{deal.store}</div>
            </div>
            <div style={{ padding: "14px 14px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: tx, lineHeight: 1.35, marginBottom: 6, fontFamily: "'Syne',sans-serif", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{deal.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <span style={{ fontSize: 9, color: mu, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono',monospace" }}>SAVE </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: accent, fontFamily: "'JetBrains Mono',monospace" }}>{deal.saves}</span>
                    </div>
                    <div style={{ fontSize: 10, color: mu, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.04em" }}>exp: {deal.expires}</div>
                </div>
            </div>
        </div>
    );
}

/* ─── HORIZONTAL SCROLL CAROUSEL ─────────────────────────────── */
function HScroll({ children, accent, dark }) {
    const ref = useRef(null);
    const [canL, setCanL] = useState(false);
    const [canR, setCanR] = useState(true);
    const chk = () => {
        if (!ref.current) return;
        setCanL(ref.current.scrollLeft > 6);
        setCanR(ref.current.scrollLeft < ref.current.scrollWidth - ref.current.clientWidth - 6);
    };
    const go = d => { ref.current && ref.current.scrollBy({ left: d * 480, behavior: "smooth" }); setTimeout(chk, 350); };
    const bd = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 10 }}>
                {[[-1, "←", canL], [1, "→", canR]].map(([d, ic, ok]) => (
                    <button key={d} onClick={() => ok && go(d)} style={{ width: 36, height: 36, border: `1.5px solid ${ok ? accent : bd}`, background: "transparent", color: ok ? accent : bd, fontSize: 16, cursor: ok ? "pointer" : "default", transition: "all 0.15s", fontFamily: "'JetBrains Mono',monospace", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {ic}
                    </button>
                ))}
            </div>
            <div ref={ref} onScroll={chk} style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {children}
            </div>
        </div>
    );
}

/* ─── MAIN APP ────────────────────────────────────────────────── */
export default function DealScout() {
    const [dark, setDark] = useState(true);
    const [accent, setAccent] = useState("#00C48C");
    const [showThemes, setShowThemes] = useState(false);
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const [email, setEmail] = useState("");
    const [subbed, setSubbed] = useState(false);
    const phText = useTypewriter(PLACEHOLDERS);

    const bg = dark ? "#0A0A0F" : "#F0EEE8";
    const sur = dark ? "#16161E" : "#FFFFFF";
    const tx = dark ? "#F0EEE8" : "#111118";
    const mu = dark ? "rgba(240,238,232,0.38)" : "rgba(17,17,24,0.38)";
    const bd = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    const navBg = dark ? "rgba(10,10,15,0.95)" : "rgba(240,238,232,0.95)";

    const feat6 = DEALS.filter(d => d.featured).slice(0, 6);
    const feat4 = DEALS.filter(d => d.featured).slice(0, 4);
    const byCat = cat => DEALS.filter(d => d.category === cat);
    const filtered = DEALS.filter(d => {
        if (!query) return false;
        const q = query.toLowerCase();
        return d.store.toLowerCase().includes(q) || d.label.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    });

    return (
        <div style={{ minHeight: "100vh", background: bg, color: tx, fontFamily: "'JetBrains Mono','Courier New',monospace", transition: "background 0.4s, color 0.3s" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Bebas+Neue&family=Syne:wght@400;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${accent}; border-radius: 0; }
        ::selection { background: ${accent}; color: #fff; }
        .srch-inp { width:100%; padding:20px 20px 20px 52px; font-size:18px; font-family:'JetBrains Mono',monospace; background:transparent; border:none; outline:none; color:${tx}; caret-color:${accent}; letter-spacing:0.01em; }
        .srch-inp::placeholder { color: ${mu}; }
        .nav-link { font-size:11px; color:${mu}; cursor:pointer; letter-spacing:0.08em; text-transform:uppercase; transition:color 0.15s; }
        .nav-link:hover { color: ${accent}; }
        .qtag { padding:5px 12px; font-size:11px; font-weight:700; background:${hexAlpha(accent, 0.08)}; color:${accent}; cursor:pointer; border:1px solid ${hexAlpha(accent, 0.25)}; font-family:'JetBrains Mono',monospace; letter-spacing:0.06em; text-transform:uppercase; transition:background 0.15s; flex-shrink:0; }
        .qtag:hover { background: ${hexAlpha(accent, 0.18)}; }
        .ticker-wrap { overflow:hidden; border-top:1px solid ${bd}; border-bottom:1px solid ${bd}; background:${hexAlpha(accent, 0.04)}; }
        .ticker-track { display:flex; animation:tick 35s linear infinite; white-space:nowrap; }
        .sec-title { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:0.04em; color:${tx}; }
        .sec-sub { font-size:10px; color:${mu}; letter-spacing:0.1em; text-transform:uppercase; margin-top:2px; font-family:'JetBrains Mono',monospace; }
        .sall { font-size:11px; color:${accent}; font-weight:700; cursor:pointer; font-family:'JetBrains Mono',monospace; letter-spacing:0.08em; text-transform:uppercase; border-bottom:1px solid ${accent}; padding-bottom:1px; }
        .sall:hover { opacity: 0.75; }
        .divider { height:1px; background:${bd}; margin:0; }
        .footer-link { font-size:12px; color:${mu}; cursor:pointer; letter-spacing:0.02em; transition:color 0.15s; line-height:2; display:block; }
        .footer-link:hover { color: ${accent}; }
        .nl-input { flex:1; padding:16px 18px; font-size:13px; font-family:'JetBrains Mono',monospace; background:transparent; border:none; outline:none; color:${tx}; caret-color:${accent}; }
        .nl-input::placeholder { color: ${mu}; }
        .fu { animation:fadeUp 0.45s ease forwards; opacity:0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes tick { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes blink { 50% { opacity:0; } }
      `}</style>

            {/* ── NAV ── */}
            <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid ${bd}`, background: navBg, backdropFilter: "blur(20px)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: accent }}>★</span> DEALSCOUT
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        {["Submit Deal", "Saved", "Alerts"].map(l => (
                            <span key={l} className="nav-link">{l}</span>
                        ))}

                        {/* ── THEME PICKER ── */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setShowThemes(s => !s)}
                                title="Change accent colour"
                                style={{ width: 28, height: 28, border: `1.5px solid ${showThemes ? accent : bd}`, background: showThemes ? accent : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all 0.18s", color: showThemes ? "#fff" : mu }}
                            >
                                ◈
                            </button>
                            {showThemes && (
                                <div style={{ position: "absolute", top: 36, right: 0, background: sur, border: `1.5px solid ${bd}`, padding: "14px", zIndex: 200, display: "flex", flexDirection: "column", gap: 8, minWidth: 140, boxShadow: `4px 4px 0 ${accent}` }}>
                                    <div style={{ fontSize: 9, color: mu, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>ACCENT COLOUR</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                        {THEMES.map(t => (
                                            <button
                                                key={t.color}
                                                onClick={() => { setAccent(t.color); setShowThemes(false); }}
                                                style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 8px", border: `1.5px solid ${accent === t.color ? t.color : bd}`, background: accent === t.color ? hexAlpha(t.color, 0.12) : "transparent", cursor: "pointer", transition: "all 0.15s" }}
                                            >
                                                <span style={{ width: 12, height: 12, background: t.color, flexShrink: 0, outline: accent === t.color ? `2px solid ${t.color}` : "none", outlineOffset: 1, display: "inline-block" }} />
                                                <span style={{ fontSize: 9, fontWeight: 700, color: accent === t.color ? t.color : mu, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>{t.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── DARK / LIGHT TOGGLE ── */}
                        <button
                            onClick={() => setDark(d => !d)}
                            style={{ width: 52, height: 26, border: `1.5px solid ${accent}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", padding: "0 4px", transition: "all 0.2s" }}
                        >
                            <div style={{ width: 18, height: 18, background: accent, marginLeft: dark ? "28px" : "0px", transition: "margin 0.25s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>
                                {dark ? "☀" : "☾"}
                            </div>
                        </button>

                        <div style={{ padding: "8px 20px", background: accent, color: "#fff", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase" }}>
                            SIGN IN
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── TICKER ── */}
            <div className="ticker-wrap">
                <div className="ticker-track" style={{ padding: "7px 0" }}>
                    {[0, 1].map(ri => (
                        <span key={ri} style={{ display: "inline-flex" }}>
                            {DEALS.map((d, i) => (
                                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", fontSize: 10, fontWeight: 700, color: mu, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    <span style={{ color: accent }}>↗</span>{d.store} — {d.discount}{d.discount !== "FREE" ? " OFF" : ""}
                                </span>
                            ))}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── HERO ── */}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 0" }}>
                <div style={{ textAlign: "center", marginBottom: 44 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", border: `1px solid ${hexAlpha(accent, 0.3)}`, marginBottom: 22, fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>
                        <span style={{ width: 6, height: 6, background: accent, display: "inline-block", animation: "blink 1.5s ease infinite" }} />
                        LIVE · {DEALS.length} ACTIVE DEALS
                    </div>
                    <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(56px,10vw,120px)", lineHeight: 0.93, letterSpacing: "0.02em", marginBottom: 18 }}>
                        SEARCH EVERY<br /><span style={{ color: accent }}>STUDENT <WordRotate words={["DEAL", "DISCOUNT", "PERK", "OFFER", "SAVING"]} /></span>
                    </h1>
                    <p style={{ fontSize: 13, color: mu, maxWidth: 460, margin: "0 auto 40px", lineHeight: 1.8, letterSpacing: "0.02em" }}>
                        The search engine built for broke students. Every discount, every platform, all verified.
                    </p>

                    {/* SEARCH BAR */}
                    <div style={{ maxWidth: 760, margin: "0 auto 14px" }}>
                        <div style={{ display: "flex", alignItems: "stretch", border: `2px solid ${focused ? accent : hexAlpha(accent, 0.35)}`, background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: focused ? `0 0 0 3px ${hexAlpha(accent, 0.15)}` : "none" }}>
                            <span style={{ paddingLeft: 20, fontSize: 20, color: focused ? accent : mu, display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.2s" }}>⌕</span>
                            <input className="srch-inp" value={query} onChange={e => setQuery(e.target.value)} placeholder={phText} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
                            {query && (
                                <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: mu, cursor: "pointer", padding: "0 14px", fontSize: 18, fontFamily: "'JetBrains Mono',monospace" }}>✕</button>
                            )}
                            <button
                                style={{ padding: "0 36px", background: accent, border: "none", color: "#fff", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase", flexShrink: 0 }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                            >
                                SEARCH
                            </button>
                        </div>
                    </div>

                    {/* QUICK TAGS */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                        {["Spotify", "Nike", "Apple", "Railcard", "Adobe", "Amazon"].map(t => (
                            <button key={t} className="qtag" onClick={() => setQuery(t)}>{t}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── SEARCH RESULTS ── */}
            {query.length > 0 && (
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 40px" }}>
                    <div className="divider" />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "20px 0 18px" }}>
                        <div>
                            <div className="sec-title">RESULTS</div>
                            <div className="sec-sub">{filtered.length} deals for "{query}"</div>
                        </div>
                        <button onClick={() => setQuery("")} style={{ background: "none", border: `1px solid ${bd}`, color: mu, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", padding: "6px 14px", letterSpacing: "0.08em" }}>CLEAR ✕</button>
                    </div>
                    <HScroll accent={accent} dark={dark}>
                        {filtered.length > 0 ? filtered.map((d, i) => (
                            <div key={d.id} className="fu" style={{ animationDelay: `${i * 0.04}s` }}>
                                <WideCard deal={d} accent={accent} />
                            </div>
                        )) : (
                            <div style={{ padding: "48px 0", color: mu, fontSize: 13, letterSpacing: "0.04em" }}>NO DEALS FOUND — TRY A DIFFERENT SEARCH</div>
                        )}
                    </HScroll>
                </div>
            )}

            {/* ── MAIN CONTENT ── */}
            {query.length === 0 && (
                <>
                    {/* FEATURED COLLECTION CAROUSEL */}
                    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                        <div className="divider" />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "28px 0 18px" }}>
                            <div>
                                <div className="sec-title">★ FEATURED COLLECTION</div>
                                <div className="sec-sub">Hand-picked top offers this week</div>
                            </div>
                            <span className="sall">See all →</span>
                        </div>
                        <HScroll accent={accent} dark={dark}>
                            {feat6.map((d, i) => (
                                <div key={d.id} className="fu" style={{ animationDelay: `${i * 0.07}s` }}>
                                    <WideCard deal={d} accent={accent} />
                                </div>
                            ))}
                        </HScroll>
                    </div>

                    {/* TOP PICKS 4-CARD ROW */}
                    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
                            <div>
                                <div className="sec-title">TOP PICKS</div>
                                <div className="sec-sub">Most claimed deals right now</div>
                            </div>
                            <span className="sall">See all →</span>
                        </div>
                        <div style={{ display: "flex", gap: 14 }}>
                            {feat4.map((d, i) => (
                                <div key={d.id} className="fu" style={{ flex: 1, animationDelay: `${i * 0.06}s` }}>
                                    <FeatCard deal={d} accent={accent} dark={dark} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ maxWidth: 1200, margin: "40px auto 0", padding: "0 24px" }}>
                        <div className="divider" />
                    </div>

                    {/* CATEGORY CAROUSELS */}
                    {CATEGORIES.map((cat, ci) => {
                        const catDeals = byCat(cat);
                        if (!catDeals.length) return null;
                        return (
                            <div key={cat} style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
                                    <div>
                                        <div className="sec-title">{CAT_ICONS[cat]} {cat.toUpperCase()}</div>
                                        <div className="sec-sub">{catDeals.length} deals available</div>
                                    </div>
                                    <span className="sall">See all →</span>
                                </div>
                                <HScroll accent={accent} dark={dark}>
                                    {catDeals.map((d, i) => (
                                        <div key={d.id} className="fu" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <DealCard deal={d} accent={accent} dark={dark} />
                                        </div>
                                    ))}
                                </HScroll>
                                {ci < CATEGORIES.length - 1 && (
                                    <div style={{ marginTop: 36 }}><div className="divider" /></div>
                                )}
                            </div>
                        );
                    })}
                </>
            )}

            {/* ── NEWSLETTER ── */}
            <div style={{ borderTop: `1px solid ${bd}`, borderBottom: `1px solid ${bd}`, marginTop: 56, background: hexAlpha(accent, dark ? 0.05 : 0.04) }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 24px", display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
                    <div style={{ flex: "0 0 auto", maxWidth: 380 }}>
                        <div style={{ fontSize: 10, color: accent, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>NEWSLETTER</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: "0.04em", lineHeight: 1.05, marginBottom: 12 }}>
                            NEVER MISS A<br /><span style={{ color: accent }}>STUDENT DEAL</span>
                        </div>
                        <p style={{ fontSize: 12, color: mu, lineHeight: 1.8, letterSpacing: "0.02em" }}>
                            Get the best verified deals delivered to your inbox every week. No spam, just savings.
                        </p>
                    </div>
                    <div style={{ flex: 1, minWidth: 260 }}>
                        {subbed ? (
                            <div style={{ padding: "24px", border: `2px solid ${accent}`, textAlign: "center" }}>
                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: accent, letterSpacing: "0.04em", marginBottom: 6 }}>YOU'RE IN! ★</div>
                                <div style={{ fontSize: 12, color: mu, letterSpacing: "0.04em" }}>Check your inbox for a confirmation.</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "flex", border: `2px solid ${hexAlpha(accent, 0.35)}`, marginBottom: 12, background: dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)" }}>
                                    <input className="nl-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@university.ac.uk" />
                                    <button
                                        onClick={() => email.includes("@") && setSubbed(true)}
                                        style={{ padding: "0 28px", background: accent, border: "none", color: "#fff", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase", flexShrink: 0 }}
                                    >
                                        SUBSCRIBE
                                    </button>
                                </div>
                                <div style={{ fontSize: 10, color: mu, letterSpacing: "0.06em" }}>
                                    ✓ Weekly digest &nbsp;·&nbsp; ✓ Expiry alerts &nbsp;·&nbsp; ✓ Exclusive drops
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <footer style={{ borderTop: `1px solid ${bd}`, background: dark ? "#0A0A0F" : "#F0EEE8" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 40px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 32, marginBottom: 40 }}>
                        {/* Brand col */}
                        <div>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ color: accent }}>★</span> DEALSCOUT
                            </div>
                            <p style={{ fontSize: 11, color: mu, lineHeight: 1.9, letterSpacing: "0.02em", maxWidth: 200 }}>
                                The search engine for student deals. Verified, curated, and always up to date.
                            </p>
                            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                                {["tw", "ig", "tk", "li"].map(s => (
                                    <div
                                        key={s}
                                        style={{ width: 32, height: 32, border: `1px solid ${bd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: mu, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.04em", transition: "border-color 0.15s, color 0.15s" }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = bd; e.currentTarget.style.color = mu; }}
                                    >{s}</div>
                                ))}
                            </div>
                        </div>
                        {/* Link cols */}
                        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                            <div key={heading}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>{heading}</div>
                                {links.map(l => (
                                    <a key={l} href="#" className="footer-link">{l}</a>
                                ))}
                            </div>
                        ))}
                    </div>
                    {/* Bottom bar */}
                    <div style={{ borderTop: `1px solid ${bd}`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ fontSize: 10, color: mu, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            © 2025 DEALSCOUT · ALL DEALS VERIFIED
                        </div>
                        <div style={{ display: "flex", gap: 24 }}>
                            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(l => (
                                <span
                                    key={l}
                                    style={{ fontSize: 10, color: mu, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}
                                    onMouseEnter={e => { e.currentTarget.style.color = accent; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = mu; }}
                                >{l}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
