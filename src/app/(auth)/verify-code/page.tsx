"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import axios, { AxiosError } from "axios";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyCodePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const form = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      verifyCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof verifyCodeSchema>) {
    setIsSubmitting(true);
    try {
      const result = await axios.post("/api/verify-code", {
        username,
        verifyCode: values.verifyCode,
      });
      toast.success("Verify success", {
        description: result.data.message,
      });

      router.replace("/sign-in");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error(`Verify email failed`, {
        description:
          axiosError.response?.data.message ||
          (error instanceof Error ? error.message : `Something went wrong`),
      });

      form.resetField("verifyCode");
    } finally {
      setIsSubmitting(false);
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
              name="verifyCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primaryText">
                    Verification Code:
                  </FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      onChange={field.onChange}
                      value={field.value}
                    >
                      <InputOTPGroup className="text-primaryText">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                <>Verify</>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyCodePage;
