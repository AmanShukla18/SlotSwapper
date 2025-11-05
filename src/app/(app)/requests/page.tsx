import { getCurrentUser } from "@/lib/auth";
import { getPopulatedSwapRequests } from "@/lib/placeholder-data";
import { RequestsTabs } from "@/components/requests/requests-tabs";

export default async function RequestsPage() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { incoming, outgoing } = await getPopulatedSwapRequests(user.id);
    
    return (
        <div className="container mx-auto max-w-4xl">
             <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Swap Requests
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage your incoming and outgoing slot swap proposals.
                </p>
            </div>
            <RequestsTabs incoming={incoming} outgoing={outgoing} />
        </div>
    );
}
