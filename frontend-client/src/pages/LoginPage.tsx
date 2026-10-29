import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { SIGN_IN_MUTATION } from "../graphql/Userqueries";
import "../styles/main.css";
import logo from "../assets/ByteBitesLogo/logo.png";
import bg from "../assets/loginwallpaper.jpg";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const [signIn, { loading, error }] = useMutation(SIGN_IN_MUTATION);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
    try {
        const { data } = await signIn({
            variables: { email, password },
        });
        const { accessToken, refreshToken } = data.signIn;

        const { error: supaErr } = await supabase.auth.setSession({
            access_token:  accessToken,
            refresh_token: refreshToken,
        });
        if (supaErr) {
            console.error("Failed to set Supabase session", supaErr);
            return;
        }else {
            navigate("/dashboard");
        }

    } catch (err) {
        console.error("Login error:", err);

        const errorMessage =
            (err instanceof Error && err.message.includes("invalid_credentials"))
                ? "Invalid email or password. Please try again."
                : "Something went wrong. Please try again later.";

        alert(errorMessage);
    }
};

    return (
        <div className="py-16 flex justify-center items-center min-h-screen bg-gray-100">
            <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-4xl"> 
                <div className="hidden lg:block w-1/2">
                    <img src={bg} alt="Background" className="w-full h-full object-cover" />
                </div>
                <form onSubmit={handleLogin} className="flex flex-col justify-center p-8 w-full lg:w-1/2">
                    <div className="flex items-center justify-center mt-1 mb-1 w-full">
                        <img src={logo} alt="Logo" className="h-20 w-20 object-contain" />
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-700 text-center mt-1 mb-1">MealFlow</h2>
                    <p className="text-lg text-gray-600 text-center mt-1 mb-1">Welcome back!</p>
                    <div className="mt-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                        <input 
                            className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" 
                            type="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            autoComplete="username"
                        />
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                            <span className="text-xs text-blue-500 cursor-pointer" onClick={() => navigate("/forgot")}>Forgot Password</span>
                        </div>
                        <div className="relative">
                            <input 
                                className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none pr-10" 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                placeholder="Enter your password"
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                // className="absolute inset-y-0 right-3 flex items-center justify-center w-10 h-10 bg-black text-white m-1 rounded-full"
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 m-1 rounded-full"
                            >
                                {showPassword ? (
                                    <EyeOffIcon size={20} className="text-white" />
                                ) : (
                                    <EyeIcon size={20} className="text-white" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button 
                            type="submit"
                            className="bg-gray-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-gray-600"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm mt-2">
                            {error.message.includes("email_not_confirmed") ? (
                                "Email not confirmed. Please check your inbox for a confirmation link."
                            ) : error.message.includes("no rows in result set") || error.message.includes("Error retrieving role for") ? (
                                "This email is unknown or unregistered. Please sign up first."
                            ) : (
                                "Login failed. Please try again."
                            )}
                        </p>
                    )}
                    <p className="text-center text-gray-600 text-sm mt-4">
                        Don't have an account? <span className="text-blue-500 cursor-pointer" onClick={() => navigate("/register")}>Register here</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
