export function HeroSection() {
    return (
        <section className="py-16 md:py-24 px-4 text-center relative overflow-hidden">
            {/* Subtle decorative icons */}
            <div className="absolute top-8 left-8 text-foreground/10 text-4xl" aria-hidden="true">
                ⚡
            </div>
            <div className="absolute top-8 right-8 text-foreground/10 text-4xl rotate-12" aria-hidden="true">
                ◇
            </div>

            <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.95] tracking-tight uppercase mb-6">
                The best student perks.
                <br />
                <span className="bg-yellow-300 dark:bg-yellow-400 px-3 py-1 inline-block mt-2 text-black">
                    Zero signup.
                </span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto font-mono">
                Stop paying full price. Start saving immediately. No accounts. No spam. Just codes.
            </p>
        </section>
    );
}
