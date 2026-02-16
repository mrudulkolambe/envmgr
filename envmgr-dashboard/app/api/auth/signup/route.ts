import { NextResponse } from "next/server";
import { UserModel } from "@/lib/db/models/users";
import { hashPassword } from "@/lib/utils/hash";

import { signToken } from "@/lib/utils/jwt";
import { AuthValidator } from "@/lib/db/validators/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validated = AuthValidator.signupSchema.parse(body);

        const existing = await UserModel.findByEmail(validated.email);

        if (existing) {
            return NextResponse.json(
                { success: false, message: "Email already exists" },
                { status: 409 }
            );
        }

        const hashed = await hashPassword(validated.password);

        const user = await UserModel.create({
            name: validated.name,
            email: validated.email,
            password: hashed,
            username: validated.username,
        });

        const token = signToken({ id: user.id, email: user.email });

        return NextResponse.json({
            success: true,
            message: "Signup successful",
            data: { id: user.id, email: user.email, auth_token: token },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 400 }
        );
    }
}
