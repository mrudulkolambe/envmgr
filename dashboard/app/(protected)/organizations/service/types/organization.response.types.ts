export interface CreatedOrganizationData {
    _id: string;
    name: string;
    slug: string;
    createdBy: string;
    createdAt: string;
}

export interface OrganizationResponse {
    success: boolean;
    message: string;
    data: CreatedOrganizationData;
}
