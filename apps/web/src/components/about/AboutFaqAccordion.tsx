"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
    <Accordion defaultValue={["faq-0"]} openMultiple={false}>
} from "@/components/ui/accordion";

type FaqItem = {
  q: string;
  a: string;
};

export function AboutFaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion defaultValue={["faq-0"]} multiple={false}>
      {items.map((faq, index) => (
        <AccordionItem key={faq.q} value={`faq-${index}`}>
          <AccordionTrigger className="rounded-md px-2 py-4 text-sm font-semibold text-foreground hover:no-underline focus-visible:ring-2">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-4 text-sm leading-relaxed text-muted-foreground">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

