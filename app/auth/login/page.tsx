"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { login } from "@/actions/auth/login.action";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(new FormData(e.currentTarget));
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  //   email: 'test@frnt.io',
  //   password: '@gExNSDk?Q7PH$!r'

  const handleTestLogin = async () => {
    const formData = new FormData();
    setIsLoading(true);
    formData.set("email", "test@frnt.io");
    formData.set("password", "@gExNSDk?Q7PH$!r");
    await login(formData);
    setIsLoading(false);
  };

  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="#"
        className={cn(buttonVariants({ variant: "ghost" }), "absolute right-4 top-4 hidden md:right-8 md:top-8")}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          FRNT
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">Connecting Institutional TradFi with Crypto</p>
            <footer className="text-sm">
              FRNT is an institutional capital markets and advisory platform focused on digital assets and web-based
              finance.
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to your account</h1>
            <p className="text-sm text-muted-foreground">Enter your email below to sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" name="email" placeholder="Email" required />
            <Input type="password" name="password" placeholder="Password" required />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLoading ? "Loading..." : "Sign In"}
            </Button>
            <Button type="button" className="w-full" onClick={handleTestLogin} isLoading={isLoading}>
              Test Login
            </Button>
          </form>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
