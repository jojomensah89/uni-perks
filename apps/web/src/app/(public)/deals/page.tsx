import { redirect } from "next/navigation";

// /deals now redirects to /browse — individual deals live at /deals/[id]
export default function DealsPage() {
    redirect("/browse");
}
