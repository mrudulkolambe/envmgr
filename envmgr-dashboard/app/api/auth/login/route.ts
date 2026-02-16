import { NextResponse } from "next/server";
import { AuthValidator } from "@/lib/db/validators/auth";
import { UserModel } from "@/lib/db/models/users";
import { comparePassword } from "@/lib/utils/hash";

import { signToken } from "@/lib/utils/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = AuthValidator.loginSchema.parse(body);

    const user = await UserModel.findByEmail(validated.email);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const match = await comparePassword(validated.password, user.password);

    if (!match) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({ id: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: { id: user.id, email: user.email, auth_token: token },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}
