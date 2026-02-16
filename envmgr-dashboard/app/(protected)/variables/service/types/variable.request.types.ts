import { EnvironmentVariableValidator } from "@/lib/db/validators/variable";
import { z } from "zod";

export type CreateVariableRequest = z.infer<typeof EnvironmentVariableValidator.createVariableSchema>;

export interface GetVariablesParams {
    environmentId?: string;
    projectId?: string;
    page?: number;
    limit?: number;
    search?: string;
}
