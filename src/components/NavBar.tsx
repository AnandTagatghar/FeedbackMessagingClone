"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { brand_name } from "@/utils/constants";
import { signOut, useSession } from "next-auth/react";

const NavBar = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

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
          <>
            <p>Welcome, {user.username}</p>
            <Link href="/my-projects">
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
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
