"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { brand_name } from "@/utils/constants";
import { signOut, useSession } from "next-auth/react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { acceptMessagesSchema } from "@/schemas/acceptMessagesSchema";
import z from "zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";

const NavBar = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const { watch, setValue } = useForm<z.infer<typeof acceptMessagesSchema>>({
    resolver: zodResolver(acceptMessagesSchema),
    defaultValues: {
      isAcceptingMessages: false,
    },
  });

  const [isFetchingSwitch, setIsFetchingSwitch] = useState<boolean>(false);

  const acceptingMessages = watch("isAcceptingMessages");

  async function fetchSwitchFromApi() {
    setIsFetchingSwitch(true);
    try {
      const result = await axios.get(
        `/api/dashboard/fetch-is-accepting-message-status?userId=${user._id}`
      );

      setValue("isAcceptingMessages", result.data.data.isAcceptingMessages);
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Failed to fetch accepting messages details", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });
    } finally {
      setIsFetchingSwitch(false);
    }
  }

  async function handleSwitch() {
    setIsFetchingSwitch(true);
    try {
      await axios.put(
        `/api/dashboard/fetch-is-accepting-message-status?userId=${user._id}`,
        {
          isAcceptingMessages: !acceptingMessages,
        }
      );

      setValue("isAcceptingMessages", !acceptingMessages);
      window.location.reload();
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Failed to update swtich value", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });
    } finally {
      setIsFetchingSwitch(false);
    }
  }

  useEffect(() => {
    if (user == undefined) {
      return;
    }

    fetchSwitchFromApi();
  }, [acceptingMessages, user]);

  return (
    <div className="w-full h-30 bg-cardColor flex justify-between items-center">
      <h2 className="text-primaryText font-extrabold text-4xl ml-20">
        <Link href="/dashboard">{brand_name}</Link>
      </h2>
      <div className="text-primaryText mr-20 flex gap-3 items-center">
        {!user && (
          <Link href={"/sign-in"}>
            <Button
              variant={"outline"}
              className="text-backgroundPrimary text-md font-semibold hover:cursor-pointer active:opacity-50 hover:opacity-75"
            >
              Login
            </Button>
          </Link>
        )}

        {user && (
          <div className="flex gap-4 items-center">
            <HoverCard>
              <HoverCardTrigger className="block">
                <Switch
                  checked={acceptingMessages}
                  onCheckedChange={() => {
                    handleSwitch();
                  }}
                  disabled={isFetchingSwitch}
                />
              </HoverCardTrigger>
              <HoverCardContent>Accept Messages Toggle</HoverCardContent>
            </HoverCard>

            <p className="py-2">Welcome, {user.username}</p>

            <Link href="/dashboard/my-projects">
              <Button
                variant={"secondary"}
                className="text-backgroundPrimary text-md font-semibold hover:cursor-pointer active:opacity-50 hover:opacity-75"
              >
                My Projects
              </Button>
            </Link>
            <Button
              variant={"outline"}
              className="text-backgroundPrimary text-md font-semibold hover:cursor-pointer active:opacity-50 hover:opacity-75"
              onClick={handleSignOut}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
