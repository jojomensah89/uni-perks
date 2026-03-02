import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { authClient } from "@/lib/auth-client";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await authClient.getSession({
        fetchOptions: {
            headers: await headers(),
            throw: true,
        },
    });

    if (!session?.user) {
        redirect("/login");
    }
    // if (session.user.role !== "admin") {
    //     redirect("/");
    // }

    return (
        <div className="h-screen flex overflow-hidden bg-background">
            <SidebarProvider>
                <AdminNav />
                <SidebarInset className="flex flex-col min-h-0 flex-1">
                    {/* Admin topbar */}
                    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 bg-background">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <span className="text-sm font-semibold text-muted-foreground">Admin Panel</span>
                    </header>
                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="container mx-auto p-8">
                            {children}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
