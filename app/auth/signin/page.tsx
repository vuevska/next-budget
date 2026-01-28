import { redirect } from "next/navigation";
import GoogleSignInButton from "@/app/components/singin/GoogleSignInButton";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Next Budget
            </h1>
            <p className="text-slate-600">Manage your finances with ease</p>
          </div>

          <div className="space-y-4">
            <GoogleSignInButton />
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>By signing in, you agree to our Terms of Service</p>
          </div>
        </div>

        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>Secure authentication powered by NextAuth.js</p>
        </div>
      </div>
    </div>
  );
}
