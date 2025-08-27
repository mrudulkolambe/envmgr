import { SignIn, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="bg-white min-h-screen min-w-screen flex items-center justify-center">
    <SignInButton mode="modal"><button className="text-black">Sign In</button></SignInButton>
    </div>
  );
}
