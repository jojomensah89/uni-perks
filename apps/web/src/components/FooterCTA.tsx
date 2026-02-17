'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner"

export function FooterCTA() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                toast('Subscribed!', {
                    description: 'You\'ll receive the latest student deals in your inbox.',
                });
                setEmail('');
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            toast('Error', {
                description: 'Failed to subscribe. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <footer className="bg-blue-50 dark:bg-blue-950 px-10 py-10 text-center border-t border-border flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold leading-tight">Don't miss the next drop</h2>
            <p className="text-sm text-foreground/70">Join 50,000+ students saving money every day.</p>
            <form onSubmit={handleSubscribe} className="flex gap-4 mt-4 max-w-[500px] w-full">
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="What's your uni email?"
                    className="flex-1 bg-transparent border border-border rounded-full px-6 py-3 text-sm outline-none placeholder:text-foreground/40"
                    required
                    aria-label="Email address"
                />
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground px-5 py-3 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                >
                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                </Button>
            </form>
        </footer>
    );
}
