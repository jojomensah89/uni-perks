import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { authClient } from "@/lib/auth-client";

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
    // Check for admin role (for now, we'll allow all logged-in users until DB is migrated)
    // TODO: Uncomment after DB migration
    // if (session.user.role !== "admin") {
    //     redirect("/");
    // }

    return (
        <div className="flex h-screen">
            <AdminNav />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
