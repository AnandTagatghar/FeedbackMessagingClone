"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import DashboardCard from "@/components/DashboardCard";

const dashboardPage = () => {
  const [cardsData, setCardsData] = useState([]);

  const fetchData = async () => {
    if (cardsData.length == 0) {
      try {
        const result = await axios.get("/api/dashboard/fetch-all-uploads");

        setCardsData(result.data.data);
        toast.success("Uploads fetched successfully");
      } catch (error: any) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error(axiosError.response?.data);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-w-full min-h-full bg-backgroundPrimary">
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
        >
          <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
            Every Spark Needs Oxygen.
          </div>
          <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4 text-center">
            Every project begins with a spark. Let others help it grow into
            fire.
          </div>
          <Link href="/dashboard/upload">
            <button className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2 hover:opacity-75 hover:cursor-pointer active:opacity-50">
              upload
            </button>
          </Link>
        </motion.div>
      </AuroraBackground>

      <div className="p-10 bg-backgroundPrimary w-full h-full flex flex-col items-center">
        {cardsData.length > 0 ? (
          <>
            <h2 className="text-primaryText font-bold self-start py-5 text-2xl sm:text-3xl md:text-4xl">
              Below are fetched project&apos;s you can review:
            </h2>
            {cardsData.map((cardData, i) => {
              return <DashboardCard key={i} userData={cardData} />;
            })}
          </>
        ) : (
          <>
            <div className="text-primaryText font-semibold text-2xl">
              No projects to available to pop.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default dashboardPage;
