"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const WORDS = ["offer", "discount", "deal", "benefit", "perk"];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    },
};

const LovableHeroSection = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % WORDS.length);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col items-center">
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover [transform:scaleY(-1)]"
                >
                    <source
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[26.416%] to-white to-[66.943%]" />
            </div>

            {/* Content */}
            <motion.div
                className="relative z-10 w-full max-w-[1200px] pt-[290px] px-6 flex flex-col items-center text-center gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Heading */}
                <motion.h1
                    variants={itemVariants}
                    className="font-geist font-medium text-[clamp(48px,6vw,80px)] leading-[0.9] tracking-[-0.04em] text-hero flex flex-col items-center"
                >
                    <span>Every student</span>
                    <div className="h-[110px] overflow-hidden flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={WORDS[index]}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -40, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                className="font-instrument italic text-[clamp(60px,7.5vw,100px)] text-hero block"
                            >
                                {WORDS[index]}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </motion.h1>

                {/* Description */}
                <motion.p
                    variants={itemVariants}
                    className="font-geist text-lg text-hero-body opacity-80 max-w-[554px] leading-relaxed [text-wrap:pretty]"
                >
                    Access exclusive discounts, student-only offers, and curated deals from
                    your favorite brands. All in one place, verified for your university
                    email.
                </motion.p>

                {/* CTA */}
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-6">
                    <motion.button
                        whileHover={{ scale: 0.985 }}
                        whileTap={{ scale: 0.96 }}
                        className="hero-cta-btn px-10 py-4 rounded-[32px] font-geist font-medium text-[15px] text-primary-foreground transition-all duration-200"
                    >
                        Create Free Account
                    </motion.button>

                    {/* Social Proof */}
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-full bg-secondary border-2 border-background"
                                />
                            ))}
                        </div>
                        <span className="font-geist text-[13px] font-medium text-hero-body opacity-60 uppercase tracking-wider">
                            1,020+ Verified Reviews
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default LovableHeroSection;
