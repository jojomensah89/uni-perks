import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { InfoIcon, ExternalLinkIcon } from "lucide-react";

interface DealConditionsAccordionProps {
    conditions?: string[] | null;
    termsUrl?: string | null;
}

export function DealConditionsAccordion({
    conditions,
    termsUrl,
}: DealConditionsAccordionProps) {
    if ((!conditions || conditions.length === 0) && !termsUrl) {
        return null;
    }

    return (
        <div className="w-full mt-4">
            <Accordion>
                <AccordionItem value="conditions">
                    <AccordionTrigger className="text-sm font-semibold text-foreground py-3">
                        Conditions
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-muted-foreground">
                        {/* Condition Bullet Points */}
                        {conditions && conditions.length > 0 && (
                            <ul className="space-y-3 mb-4 list-none p-0 m-0">
                                {conditions.map((condition, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm leading-relaxed">
                                        <InfoIcon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/60" />
                                        <span>{condition}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* External Terms Link */}
                        {termsUrl && (
                            <div className="flex items-start gap-2 text-sm mt-3">
                                <InfoIcon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/60" />
                                <a
                                    href={termsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center hover:text-foreground transition-colors underline underline-offset-4"
                                >
                                    Full terms and conditions
                                    <ExternalLinkIcon className="ml-1 w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
