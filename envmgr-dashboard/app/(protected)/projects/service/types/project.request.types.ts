import { ProjectValidator } from "@/lib/db/validators/project";
import { z } from "zod";

export type CreateProjectRequest = z.infer<typeof ProjectValidator.createProjectSchema>;

export interface GetProjectsParams {
    page?: number;
    limit?: number;
    search?: string;
    memberId?: string;
}

