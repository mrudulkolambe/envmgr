import { EnvironmentValidator } from "@/lib/db/validators/environment";
import { z } from "zod";

export type CreateEnvironmentRequest = z.infer<typeof EnvironmentValidator.createEnvironmentSchema>;

export interface GetEnvironmentsParams {
    projectId?: string;
    page?: number;
    limit?: number;
    search?: string;
}
