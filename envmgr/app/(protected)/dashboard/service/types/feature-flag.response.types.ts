export interface FeatureFlag {
    id: string
    name: string
    key: string
    description: string | null
    isActive: boolean
    projectId: string
    createdAt: string
    updatedAt: string
}
