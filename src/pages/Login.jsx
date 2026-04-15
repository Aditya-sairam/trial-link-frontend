import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn(email, password);
      navigate("/patients");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-stretch">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
          <img src="/logo.jpeg" alt="Trial Link" className="h-14 rounded-xl" />
          <span className="text-2xl font-bold text-white">Trial Link AI</span>
        </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Connecting patients to the trials that matter.
          </h2>
          <p className="text-blue-200 text-base leading-relaxed">
            Trial Link uses AI-powered matching to bridge the gap between patients and cutting-edge clinical research — faster and more accurately than ever before.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-blue-600 rounded-xl p-5">
            <p className="text-3xl font-bold">20,000+</p>
            <p className="text-blue-200 text-sm mt-1">Clinical trials analyzed</p>
          </div>
          <div className="bg-blue-600 rounded-xl p-5">
            <p className="text-3xl font-bold">45+</p>
            <p className="text-blue-200 text-sm mt-1">Synthetic patient profiles mapped</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.jpeg" alt="Trial Link" className="h-10 mx-auto mb-3" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-8">Welcome back to Trial Link</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    default:
      return "Something went wrong. Please try again.";
  }
}
