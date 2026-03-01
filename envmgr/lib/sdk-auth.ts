import { prisma } from "@/lib/prisma";

export async function validateApiKey(key: string | null) {
    if (!key) return null;

    const apiKey = await prisma.apiKey.findUnique({
        where: { key },
        include: {
            project: true,
        },
    });

    if (!apiKey) return null;

    // Track usage (non-blocking)
    prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
    }).catch(console.error);

    return apiKey;
}
