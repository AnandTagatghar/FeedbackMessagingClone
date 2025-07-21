"use client";

import NavBar from "@/components/NavBar";

import * as React from "react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import data from "@/data/homePageCarouselData.json";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import infiniteCardsData from "@/data/homePageInfiniteCards.json";
import Footer from "@/components/Footer";

export default function Home() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="min-w-screen min-h-screen bg-backgroundPrimary">
      <NavBar />

      <div className="flex justify-center items-center">
        <div className="px-10 py-20  text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-primaryText">
            Welcome To Improve Your Skill
          </h1>
          <p className="text-secondaryText tracking-wide mt-2 text-sm sm:text-md">
            Get Honest, Anonymous Feedback on Your Projects
          </p>
        </div>
      </div>

      <div className="w-full h-full p-10 flex justify-center items-center">
        <div className="mx-auto max-w-md">
          <Carousel setApi={setApi} className="w-full max-w-md">
            <CarouselContent>
              {data.map((singleData, index) => (
                <CarouselItem key={index}>
                  <Card className="p-5">
                    <CardTitle className="font-bold text-2xl">
                      {singleData.title}
                    </CardTitle>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <img
                        src={singleData.image}
                        alt={singleData.title}
                        className="w-full h-full object-cover"
                      />
                    </CardContent>
                    <CardFooter className="text-secondaryText">
                      {singleData.description}
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <div className="text-muted-foreground py-2 text-center text-sm">
            Slide {current} of {count}
          </div>
        </div>
      </div>

      <div className="w-full h-full px-10">
        <h1 className="pt-20 text-center text-2xl sm:text-4xl lg:text-5xl font-bold text-primaryText">
          The best way to predict the future is to invent it.
        </h1>
        <div className="text-center flex justify-center">
          <p className="text-secondaryText tracking-wide mt-2 text-sm sm:text-md w-[80%]">
            A powerful reminder that true innovation comes from taking bold
            action today. Transform ideas into impact — don’t wait for the
            future, build it.
          </p>
        </div>
        <div className="h-[30rem] rounded-md flex flex-col antialiased  dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={infiniteCardsData}
            direction="left"
            speed="slow"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
