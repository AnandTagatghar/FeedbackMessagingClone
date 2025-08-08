"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInSchema } from "@/schemas/signInSchema";
import z from "zod";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { FaGoogle } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittingGoogleButton, setIsSubmittingGoogleButton] =
    useState<boolean>(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        identifier: values.identifier,
        password: values.password,
        redirect: false,
      });

      if (result?.ok) {
        router.replace("/dashboard");

        toast.success("Login success");
      } else {
        toast.error("Login failed", {
          description: result?.error || `Something went wrong`,
        });

        form.resetField("identifier");
        form.resetField("password");
      }
    } catch (error: unknown) {
      console.error(`Error on login: ${error}`);

      const axiosError = error as AxiosError<ApiResponse>;

      toast.error(`Login Failed`, {
        description:
          axiosError.response?.data.message ||
          (error instanceof Error ? error.message : `Something went wrong`),
      });

      form.resetField("identifier");
      form.resetField("password");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmitGoogleButton() {
    setIsSubmittingGoogleButton(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });

      toast.success("Login success using google");
    } catch (error: unknown) {
      console.error(`Error on login: ${error}`);

      toast.error(`Login failed using google`, {
        description:
          error instanceof Error ? error.message : `Something went wrong`,
      });
    } finally {
      setIsSubmittingGoogleButton(false);
    }
  }

  return (
    <div className="w-screen h-screen bg-backgroundPrimary flex justify-center items-center">
      <div className="bg-cardColor p-10 rounded-lg w-[30rem]">
        <div className="text-center">
          <h1 className="text-primaryText text-3xl sm:text-4xl md:text-5xl font-bold">
            Welcome Back!
          </h1>
          <p className="text-secondaryText text-sm  md:text-md">
            Sign in to access your dashboard and collect feedback anonymously.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-5"
          >
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primaryText">
                    Email/Username:
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email/Username"
                      {...field}
                      className="text-primaryText"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primaryText">Password:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Password"
                      type="password"
                      {...field}
                      className="text-primaryText"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex flex-col justify-center items-center">
              <Button
                type="submit"
                variant={"outline"}
                className="text-backgroundPrimary  text-md font-semibold hover:cursor-pointer active:opacity-50 hover:opacity-75"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>Login</>
                )}
              </Button>

              <div className="relative flex items-center my-6 text-secondaryText w-full">
                <Separator className="flex-1 border-t border-secondaryText" />
                <span className="px-4 text-sm text-muted-foreground">or</span>
                <Separator className="flex-1 border-t border-secondaryText" />
                <br />
              </div>
              <div className="text-secondaryText w-full flex items-center justify-center">
                <Button
                  type="button"
                  variant={"outline"}
                  className="text-backgroundPrimary hover:cursor-pointer hover:opacity-75 active:opacity-50"
                  onClick={onSubmitGoogleButton}
                  disabled={isSubmittingGoogleButton}
                >
                  {isSubmittingGoogleButton ? (
                    <>
                      <Loader2 className="animate-spin" /> Please wait
                    </>
                  ) : (
                    <>
                      <FaGoogle className="inline-block mr-2" />
                      <span>Sign In using Google</span>
                    </>
                  )}
                </Button>
              </div>

              <p className="text-primaryText mt-5">
                Not yet registered?{" "}
                <Link href={"/sign-up"} className="underline text-blue-500">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignInPage;
