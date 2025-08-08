"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios from "axios";
import { useDebounceValue } from "usehooks-ts";

const SignUpPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [username, setUsername] = useDebounceValue("", 500);
  const [usernameMessage, setUsernameMessage] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    const checkUsernameUnique = async () => {
      if (username) {
        setUsernameMessage("");
        try {
          const result = await axios.get(
            `/api/check-username-unique?username=${username}`,
            { signal: controller.signal }
          );

          setUsernameMessage(result.data.message);
        } catch (error: unknown) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? `Username is not unique`
          );
        }
      }
    };

    checkUsernameUnique();

    return () => {
      controller.abort();
    };
  }, [username]);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    setIsSubmitting(true);
    try {
      await axios.post("/api/sign-up", {
        email: values.email,
        username: values.username,
        password: values.password,
      });

      toast.success("Sign up process done, please verify you email");

      router.replace(`/verify-code?username=${form.getValues("username")}`);
    } catch (error: unknown) {
      console.error(`Error on login: ${error}`);

      const axiosError = error as AxiosError<ApiResponse>;

      toast.error(`Sign-Up Failed`, {
        description:
          axiosError.response?.data.message ||
          (error instanceof Error ? error.message : `Something went wrong`),
      });

      form.resetField("email");
      form.resetField("username");
      form.resetField("password");
      setUsernameMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-screen h-screen bg-backgroundPrimary flex justify-center items-center">
      <div className="bg-cardColor p-10 rounded-lg w-[30rem]">
        <div className="text-center">
          <h1 className="text-primaryText text-2xl sm:text-3xl md:text-4xl font-bold">
            Create Your Account
          </h1>
          <p className="text-secondaryText text-sm  md:text-md">
            Join us and start gathering honest, anonymous feedback.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-5"
          >
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primaryText">Username:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      className="text-primaryText"
                      onChange={(e) => {
                        field.onChange(e);
                        setUsername(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {usernameMessage && usernameMessage.includes("not") ? (
                    <>
                      <p className="text-red-500">{usernameMessage}</p>
                    </>
                  ) : (
                    <p className="text-green-500">{usernameMessage}</p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primaryText">Email:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
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
                  <>Signup</>
                )}
              </Button>

              <p className="text-primaryText mt-5">
                Already have an account?{" "}
                <Link href={"/sign-in"} className="underline text-blue-500">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignUpPage;
