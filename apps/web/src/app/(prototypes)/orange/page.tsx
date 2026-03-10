"use client"

import { useState, useRef, useEffect } from "react";
import { WordRotate } from "@/components/word-rotate";

const DEALS = [
    { id: 1, store: "Gymshark", category: "Fashion", discount: "15%", label: "Student Discount Sitewide", sub: "For students only · Online · Fashion", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80", logoColor: "#000", featured: true, tag: "SPONSORED", saves: "Up to £30", expires: "Ongoing", rating: 4.6 },
    { id: 2, store: "Spotify", category: "Entertainment", discount: "50%", label: "Premium Student Plan", sub: "For students only · Online · Music", img: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80", logoColor: "#1DB954", featured: true, tag: "VERIFIED", saves: "£5.99/mo", expires: "Ongoing", rating: 4.9 },
    { id: 3, store: "ASOS", category: "Fashion", discount: "10%", label: "Student Discount on Everything", sub: "For students only · Online · Fashion", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80", logoColor: "#000", featured: true, tag: "HOT", saves: "Up to £40", expires: "No expiry", rating: 4.7 },
    { id: 4, store: "Apple", category: "Tech", discount: "£150", label: "Education Pricing on Mac & iPad", sub: "For students only · In-store & Online", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", logoColor: "#555", featured: true, tag: "EXCLUSIVE", saves: "£150–300", expires: "Sep 30", rating: 4.8 },
    { id: 5, store: "Adobe", category: "Tech", discount: "60%", label: "Creative Cloud All Apps", sub: "For students only · Online · Software", img: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&q=80", logoColor: "#FF0000", featured: false, tag: "VERIFIED", saves: "£30/mo", expires: "Ongoing", rating: 4.9 },
    { id: 6, store: "Railcard", category: "Travel", discount: "30%", label: "16-25 Railcard Annual Pass", sub: "For students · All UK rail journeys", img: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80", logoColor: "#003087", featured: false, tag: "POPULAR", saves: "Avg £84/yr", expires: "1 year", rating: 4.8 },
    { id: 7, store: "Amazon", category: "Lifestyle", discount: "FREE", label: "Prime Student 6-Month Trial", sub: "For students only · Online · Shopping", img: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=600&q=80", logoColor: "#FF9900", featured: false, tag: "HOT", saves: "£4.99/mo", expires: "Limited", rating: 4.7 },
    { id: 8, store: "Deliveroo", category: "Food", discount: "FREE", label: "Plus Membership 3-Month Trial", sub: "For students only · Online · Food delivery", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80", logoColor: "#00CCBC", featured: false, tag: "NEW", saves: "£8.99/mo", expires: "Limited", rating: 4.6 },
    { id: 9, store: "Notion", category: "Tech", discount: "FREE", label: "Plus Plan Free for Students", sub: "For students only · Online · Productivity", img: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80", logoColor: "#000", featured: false, tag: "FREE", saves: "£8/mo", expires: "Ongoing", rating: 4.9 },
    { id: 10, store: "Nike", category: "Fashion", discount: "20%", label: "Student Exclusive on All Styles", sub: "For students only · Online · Sportswear", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", logoColor: "#111", featured: false, tag: "TRENDING", saves: "Up to £60", expires: "Ongoing", rating: 4.5 },
    { id: 11, store: "Headspace", category: "Health", discount: "85%", label: "Annual Meditation Plan", sub: "For students only · App · Wellness", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80", logoColor: "#F47D31", featured: false, tag: "EXCLUSIVE", saves: "£9.99/mo", expires: "Ongoing", rating: 4.6 },
    { id: 12, store: "Grammarly", category: "Tech", discount: "20%", label: "Premium Writing Assistant", sub: "For students only · Online · Writing", img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80", logoColor: "#15C39A", featured: false, tag: "VERIFIED", saves: "£10/mo", expires: "Ongoing", rating: 4.8 },
];

const CATEGORIES = [
    { label: "All", icon: "◈" }, { label: "Fashion", icon: "👗" }, { label: "Tech", icon: "💻" },
    { label: "Food", icon: "🍔" }, { label: "Travel", icon: "✈️" }, { label: "Entertainment", icon: "🎵" },
    { label: "Health", icon: "🧘" }, { label: "Lifestyle", icon: "🛍️" },
];

const TAG_META = {
    HOT: { bg: "#FF4820", tx: "#fff" },
    NEW: { bg: "#00C48C", tx: "#fff" },
    EXCLUSIVE: { bg: "#7B61FF", tx: "#fff" },
    VERIFIED: { bg: "#0082FF", tx: "#fff" },
    POPULAR: { bg: "#FF9500", tx: "#fff" },
    TRENDING: { bg: "#FF2D78", tx: "#fff" },
    FREE: { bg: "#00C48C", tx: "#fff" },
    SPONSORED: { bg: "rgba(140,140,140,0.25)", tx: "inherit" },
};

const PLACEHOLDERS = [
    "Search student deals…", "Find discounts on tech…", "Explore fashion deals…",
    "Save on food delivery…", "Discover travel offers…",
];

/* ── Deal Card (regular) ── */
function DealCard({ deal, dark, size = "md" }) {
    const [hov, setHov] = useState(false);
    const tag = TAG_META[deal.tag] || TAG_META.VERIFIED;
    const isLg = size === "lg";
    const accent = "#FF4820";
    const surface = dark ? "#1C1C24" : "#FFFFFF";
    const text = dark ? "#F0EEE8" : "#111118";
    const muted = dark ? "rgba(240,238,232,0.4)" : "rgba(17,17,24,0.45)";
    const bdr = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            borderRadius: 16, overflow: "hidden", background: surface,
            border: `1.5px solid ${hov ? accent : bdr}`,
            boxShadow: hov ? `0 20px 60px ${dark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.16)"}` : `0 2px 12px ${dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.06)"}`,
            transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            transform: hov ? "translateY(-6px) scale(1.015)" : "none",
            cursor: "pointer", flexShrink: 0, width: isLg ? 280 : 234,
        }}>
            {/* IMAGE */}
            <div style={{ position: "relative", height: isLg ? 200 : 162, overflow: "hidden" }}>
                <img src={deal.img} alt={deal.store} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hov ? "scale(1.08)" : "scale(1)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.48) 100%)" }} />
                {/* Discount */}
                <div style={{ position: "absolute", top: 12, left: 12, background: accent, color: "#fff", fontFamily: "'Bebas Neue',sans-serif", fontSize: isLg ? 22 : 18, letterSpacing: "0.04em", padding: "4px 12px", borderRadius: 6, boxShadow: "0 4px 12px rgba(255,72,32,0.45)" }}>
                    {deal.discount}{deal.discount !== "FREE" ? " OFF" : ""}
                </div>
                {/* Tag */}
                <div style={{ position: "absolute", top: 12, right: 12, background: tag.bg, color: tag.tx, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase" }}>{deal.tag}</div>
                {/* Brand pill */}
                <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(255,255,255,0.93)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800, color: "#111", fontFamily: "'Syne',sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {deal.store}
                </div>
            </div>
            {/* TEXT */}
            <div style={{ padding: "14px 14px 10px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: text, fontFamily: "'Syne',sans-serif", lineHeight: 1.35, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{deal.label}</div>
                <div style={{ fontSize: 11, color: muted, marginBottom: 10, letterSpacing: "0.005em" }}>{deal.sub}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <span style={{ fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Save </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{deal.saves}</span>
                    </div>
                    <div style={{ padding: "7px 14px", background: hov ? accent : "transparent", border: `1.5px solid ${hov ? accent : bdr}`, color: hov ? "#fff" : muted, borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "'Syne',sans-serif", letterSpacing: "0.06em", transition: "all 0.2s" }}>
                        GET DEAL
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Featured Hero Card ── */
function FeaturedCard({ deal, dark }) {
    const [hov, setHov] = useState(false);
    const tag = TAG_META[deal.tag] || TAG_META.VERIFIED;
    const accent = "#FF4820";

    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            borderRadius: 20, overflow: "hidden", position: "relative",
            flexShrink: 0, width: 340, height: 420, cursor: "pointer",
            transform: hov ? "translateY(-8px) scale(1.02)" : "none",
            transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: hov ? "0 32px 80px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.2)",
            border: `2px solid ${hov ? accent : "transparent"}`,
        }}>
            <img src={deal.img} alt={deal.store} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hov ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s ease" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.18) 55%,transparent 100%)" }} />
            {/* Top */}
            <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ background: accent, color: "#fff", fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: "0.04em", padding: "4px 14px", borderRadius: 8, boxShadow: "0 4px 16px rgba(255,72,32,0.5)" }}>
                    {deal.discount}{deal.discount !== "FREE" ? " OFF" : ""}
                </div>
                <div style={{ background: tag.bg, color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", padding: "5px 10px", borderRadius: 6, textTransform: "uppercase" }}>{deal.tag}</div>
            </div>
            {/* Bottom */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800, color: "#111", fontFamily: "'Syne',sans-serif" }}>{deal.store}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{deal.category}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", lineHeight: 1.3, marginBottom: 14 }}>{deal.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Save </span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#E8FF00" }}>{deal.saves}</span>
                    </div>
                    <div style={{ padding: "10px 22px", background: hov ? "#fff" : "rgba(255,255,255,0.15)", color: hov ? "#111" : "#fff", borderRadius: 10, fontSize: 12, fontWeight: 800, fontFamily: "'Syne',sans-serif", letterSpacing: "0.06em", backdropFilter: "blur(10px)", transition: "all 0.2s", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                        GET DEAL →
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Carousel wrapper ── */
function Carousel({ children, dark }) {
    const ref = useRef(null);
    const [canL, setCanL] = useState(false);
    const [canR, setCanR] = useState(true);
    const check = () => {
        if (!ref.current) return;
        setCanL(ref.current.scrollLeft > 8);
        setCanR(ref.current.scrollLeft < ref.current.scrollWidth - ref.current.clientWidth - 8);
    };
    const scroll = dir => { ref.current?.scrollBy({ left: dir * 300, behavior: "smooth" }); setTimeout(check, 350); };
    const bdr = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
    const btnBg = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";

    return (
        <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 10 }}>
                {[[-1, "‹", canL], [1, "›", canR]].map(([d, ic, ok]) => (
                    <button key={d} onClick={() => ok && scroll(d)} style={{ width: 38, height: 38, borderRadius: "50%", border: `1.5px solid ${bdr}`, background: btnBg, color: ok ? (dark ? "#fff" : "#111") : (dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"), fontSize: 18, cursor: ok ? "pointer" : "default", transition: "all 0.2s", backdropFilter: "blur(10px)", boxShadow: ok ? "0 4px 12px rgba(0,0,0,0.12)" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</button>
                ))}
            </div>
            <div ref={ref} onScroll={check} style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {children}
            </div>
        </div>
    );
}

/* ── Main App ── */
export default function DealScout() {
    const [dark, setDark] = useState(true);
    const [query, setQuery] = useState("");
    const [activeCat, setActiveCat] = useState("All");
    const [phIdx, setPhIdx] = useState(0);
    const [typed, setTyped] = useState("");
    const [del, setDel] = useState(false);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        const target = PLACEHOLDERS[phIdx]; let t;
        if (!del && typed.length < target.length) t = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 55);
        else if (!del && typed.length === target.length) t = setTimeout(() => setDel(true), 2200);
        else if (del && typed.length > 0) t = setTimeout(() => setTyped(typed.slice(0, -1)), 28);
        else if (del && typed.length === 0) { setDel(false); setPhIdx(i => (i + 1) % PLACEHOLDERS.length); }
        return () => clearTimeout(t);
    }, [typed, del, phIdx]);

    const accent = "#FF4820";
    const bg = dark ? "#111118" : "#F5F3EF";
    const surface = dark ? "#1C1C24" : "#FFFFFF";
    const text = dark ? "#F0EEE8" : "#111118";
    const muted = dark ? "rgba(240,238,232,0.4)" : "rgba(17,17,24,0.42)";
    const bdr = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    const filtered = DEALS.filter(d => {
        const q = query.toLowerCase();
        const mQ = !query || d.store.toLowerCase().includes(q) || d.label.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
        const mC = activeCat === "All" || d.category === activeCat;
        return mQ && mC;
    });

    const featured = DEALS.filter(d => d.featured);
    const byCat = cat => DEALS.filter(d => d.category === cat);
    const showSearch = query.length > 0;

    return (
        <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "'DM Sans',sans-serif", transition: "background 0.4s,color 0.3s" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        :root{--accent:${accent};}
        ::-webkit-scrollbar{height:3px;width:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:var(--accent);border-radius:4px;}
        ::selection{background:var(--accent);color:#fff;}
        .srch{width:100%;padding:18px 60px 18px 54px;font-size:16px;font-family:'DM Sans',sans-serif;font-weight:500;background:transparent;border:none;outline:none;color:${text};caret-color:var(--accent);}
        .srch::placeholder{color:${muted};}
        .chip{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:50px;font-size:13px;font-weight:600;font-family:'Syne',sans-serif;cursor:pointer;transition:all 0.2s;white-space:nowrap;flex-shrink:0;border:1.5px solid ${bdr};}
        .chip-a{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 4px 16px rgba(255,72,32,0.35);}
        .chip-i{background:${surface};color:${muted};}
        .chip-i:hover{border-color:var(--accent);color:var(--accent);}
        .tog{width:52px;height:28px;border-radius:14px;cursor:pointer;transition:background 0.3s;position:relative;border:none;padding:0;flex-shrink:0;background:${dark ? "rgba(255,72,32,0.3)" : "rgba(0,0,0,0.1)"};}
        .knob{width:22px;height:22px;border-radius:50%;position:absolute;top:3px;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);background:${dark ? "#FF4820" : "#fff"};left:${dark ? "27px" : "3px"};box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:11px;}
        .stit{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:${text};letter-spacing:-0.02em;}
        .ssub{font-size:13px;color:${muted};margin-top:3px;}
        .srow{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;}
        .sall{font-size:13px;color:var(--accent);font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;}
        .sall:hover{text-decoration:underline;}
        .qtag{padding:5px 12px;border-radius:6px;font-size:12px;font-weight:600;background:${dark ? "rgba(255,72,32,0.1)" : "rgba(255,72,32,0.07)"};color:var(--accent);cursor:pointer;border:1px solid rgba(255,72,32,0.2);font-family:'Syne',sans-serif;transition:background 0.15s;flex-shrink:0;}
        .qtag:hover{background:rgba(255,72,32,0.2);}
        .ticker-wrap{overflow:hidden;border-top:1px solid ${bdr};border-bottom:1px solid ${bdr};background:${dark ? "rgba(255,72,32,0.05)" : "rgba(255,72,32,0.04)"};}
        .ticker-track{display:flex;animation:tick 35s linear infinite;white-space:nowrap;}
        @keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .fu{animation:fadeUp 0.45s ease forwards;opacity:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{50%{opacity:0}}
      `}</style>

            {/* NAV */}
            <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid ${bdr}`, background: dark ? "rgba(17,17,24,0.92)" : "rgba(245,243,239,0.92)", backdropFilter: "blur(24px)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: accent }}>◈</span> DEALSCOUT
                    </div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        {["Submit Deal", "Saved"].map(l => (
                            <div key={l} style={{ fontSize: 13, color: muted, cursor: "pointer", fontWeight: 500 }}>{l}</div>
                        ))}
                        <button className="tog" onClick={() => setDark(d => !d)}>
                            <div className="knob">{dark ? "☀" : "☾"}</div>
                        </button>
                        <div style={{ padding: "9px 20px", background: accent, color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif", letterSpacing: "0.04em" }}>Sign in</div>
                    </div>
                </div>
            </nav>

            {/* TICKER */}
            <div className="ticker-wrap">
                <div className="ticker-track" style={{ padding: "7px 0" }}>
                    {[0, 1].map(ri => (
                        <span key={ri} style={{ display: "inline-flex" }}>
                            {DEALS.map((d, i) => (
                                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", fontSize: 11, fontWeight: 600, color: muted, fontFamily: "'Syne',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                    <span style={{ color: accent }}>↗</span> {d.store} — {d.discount}{d.discount !== "FREE" ? " OFF" : ""}
                                </span>
                            ))}
                        </span>
                    ))}
                </div>
            </div>

            {/* HERO */}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 0" }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 50, border: "1px solid rgba(255,72,32,0.25)", background: "rgba(255,72,32,0.07)", marginBottom: 20, fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block", animation: "blink 1.5s ease infinite" }} />
                        LIVE · {DEALS.length} VERIFIED DEALS
                    </div>
                    <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(52px,9vw,108px)", lineHeight: 0.92, letterSpacing: "0.01em", marginBottom: 16 }}>
                        SEARCH EVERY<br /><span style={{ color: accent }}>STUDENT <WordRotate words={["DEAL", "DISCOUNT", "PERK", "OFFER", "SAVING"]} /></span>
                    </h1>
                    <p style={{ fontSize: 15, color: muted, maxWidth: 440, margin: "0 auto", lineHeight: 1.7 }}>
                        The search engine built for broke students. Every discount, verified and ready to claim.
                    </p>
                </div>

                {/* SEARCH */}
                <div style={{ maxWidth: 700, margin: "0 auto 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", background: surface, borderRadius: 16, border: `2px solid ${focused ? accent : bdr}`, boxShadow: focused ? `0 0 0 4px rgba(255,72,32,0.12)` : `0 4px 24px rgba(0,0,0,${dark ? "0.3" : "0.07"})`, transition: "all 0.25s", overflow: "hidden" }}>
                        <span style={{ paddingLeft: 18, fontSize: 20, color: focused ? accent : muted, flexShrink: 0, transition: "color 0.2s" }}>⌕</span>
                        <input className="srch" value={query} onChange={e => setQuery(e.target.value)} placeholder={typed} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
                        {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: muted, cursor: "pointer", padding: "0 12px", fontSize: 18 }}>✕</button>}
                        <button style={{ margin: 6, padding: "12px 28px", background: accent, color: "#fff", border: "none", borderRadius: 12, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.04em", flexShrink: 0 }}>SEARCH</button>
                    </div>
                </div>

                {/* QUICK TAGS */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    {["Spotify", "Nike", "Apple", "Railcard", "Adobe", "Amazon"].map(t => (
                        <button key={t} className="qtag" onClick={() => setQuery(t)}>{t}</button>
                    ))}
                </div>

                {/* STATS */}
                <div style={{ display: "flex", justifyContent: "center", borderTop: `1px solid ${bdr}`, marginTop: 32, borderBottom: `1px solid ${bdr}` }}>
                    {[{ n: "847+", l: "Deals" }, { n: "£2.3M", l: "Saved" }, { n: "12K+", l: "Students" }, { n: "100%", l: "Verified" }].map((s, i) => (
                        <div key={i} style={{ flex: 1, textAlign: "center", padding: "20px 16px", borderLeft: i > 0 ? `1px solid ${bdr}` : "none" }}>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: accent, letterSpacing: "0.02em", lineHeight: 1 }}>{s.n}</div>
                            <div style={{ fontSize: 11, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── SEARCH RESULTS ── */}
            {showSearch && (
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
                    <div className="srow">
                        <div>
                            <div className="stit">Search Results</div>
                            <div className="ssub">{filtered.length} deals for "{query}"</div>
                        </div>
                        <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: muted, cursor: "pointer", fontSize: 13 }}>Clear ✕</button>
                    </div>
                    <Carousel dark={dark}>
                        {filtered.length > 0 ? filtered.map((d, i) => (
                            <div key={d.id} className="fu" style={{ animationDelay: `${i * 0.05}s` }}>
                                <DealCard deal={d} dark={dark} size="lg" />
                            </div>
                        )) : (
                            <div style={{ padding: "60px 0", color: muted, fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 600 }}>No deals found — try a different search</div>
                        )}
                    </Carousel>
                </div>
            )}

            {/* ── CATEGORY CHIPS ── */}
            {!showSearch && (
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 0" }}>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                        {CATEGORIES.map(c => (
                            <button key={c.label} className={`chip ${activeCat === c.label ? "chip-a" : "chip-i"}`} onClick={() => setActiveCat(c.label)}>
                                <span>{c.icon}</span>{c.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── FEATURED CAROUSEL ── */}
            {!showSearch && (
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
                    <div className="srow">
                        <div>
                            <div className="stit">✦ Featured Deals</div>
                            <div className="ssub">Hand-picked top offers this week</div>
                        </div>
                        <span className="sall">See all →</span>
                    </div>
                    <Carousel dark={dark}>
                        {(activeCat === "All" ? featured : DEALS.filter(d => d.category === activeCat)).map((d, i) => (
                            <div key={d.id} className="fu" style={{ animationDelay: `${i * 0.07}s` }}>
                                <FeaturedCard deal={d} dark={dark} />
                            </div>
                        ))}
                    </Carousel>
                </div>
            )}

            {/* ── PER-CATEGORY CAROUSELS (All view) ── */}
            {!showSearch && activeCat === "All" && ["Fashion", "Tech", "Entertainment", "Travel", "Food", "Health", "Lifestyle"].map(cat => {
                const catDeals = byCat(cat);
                if (!catDeals.length) return null;
                const icon = CATEGORIES.find(c => c.label === cat)?.icon || "●";
                return (
                    <div key={cat} style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
                        <div className="srow">
                            <div>
                                <div className="stit">{icon} {cat}</div>
                                <div className="ssub">{catDeals.length} deals available</div>
                            </div>
                            <span className="sall" onClick={() => setActiveCat(cat)}>See all →</span>
                        </div>
                        <Carousel dark={dark}>
                            {catDeals.map((d, i) => (
                                <div key={d.id} className="fu" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <DealCard deal={d} dark={dark} />
                                </div>
                            ))}
                        </Carousel>
                    </div>
                );
            })}

            {/* ── FILTERED CATEGORY GRID ── */}
            {!showSearch && activeCat !== "All" && (
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
                    <div className="srow">
                        <div>
                            <div className="stit">All {activeCat} Deals</div>
                            <div className="ssub">{byCat(activeCat).length} deals</div>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(234px,1fr))", gap: 16 }}>
                        {byCat(activeCat).map((d, i) => (
                            <div key={d.id} className="fu" style={{ animationDelay: `${i * 0.05}s` }}>
                                <DealCard deal={d} dark={dark} size="lg" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ height: 80 }} />

            {/* FOOTER */}
            <footer style={{ borderTop: `1px solid ${bdr}`, padding: "28px 24px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: accent }}>◈</span> DEALSCOUT
                    </div>
                    <div style={{ fontSize: 11, color: muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>© 2025 DealScout · All deals verified</div>
                    <div style={{ display: "flex", gap: 20, fontSize: 12, color: muted, fontWeight: 500 }}>
                        {["About", "Privacy", "Contact"].map(l => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
                    </div>
                </div>
            </footer>
        </div>
    );
}
