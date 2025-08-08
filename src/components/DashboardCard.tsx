import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

interface cardDataType {
  title: string;
  description: string;
  username: string;
  email: string;
  _id: string;
  userId: string;
  createdAt: Date;
  keys: { signedUrl: string; key: string; type: string }[];
}

const DashboardCard = ({ userData }: { userData: cardDataType }) => {
  const date = new Date(userData.createdAt);
  const displayDate = `${date.getDate()}-${date.getMonth().toString().padStart(2, "0")}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;

  return (
    <Card className="mb-10 w-full bg-cardColor text-primaryText">
      <CardHeader>
        <CardTitle>{userData.title}</CardTitle>
        <CardDescription>by {userData.username}</CardDescription>
        <CardAction>
          <p className="text-primaryText">{displayDate}</p>
        </CardAction>
      </CardHeader>
      <CardContent>
        {userData.keys.length > 0 && (
          <Carousel className="w-full max-w-xs ml-10 h-[25rem]">
            <CarouselContent>
              {userData.keys.map((obj, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6 w-full h-full">
                        {obj && obj.type.includes("image") && (
                          <div className="w-full h-full relative">
                            <Image
                              src={obj.signedUrl}
                              alt={obj.key}
                              className="object-cover rounded"
                              fill
                            />
                          </div>
                        )}

                        {obj && obj.type.includes("video") && (
                          <video
                            className="w-full h-full object-cover"
                            src={obj.signedUrl}
                            autoPlay
                            loop
                            muted
                            controls
                            controlsList="nodownload"
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}

        <h2 className="text-primaryText text-xl font-semibold">Description:</h2>
        <p className="text-secondaryText mt-5">{userData.description}</p>
      </CardContent>

      <CardFooter>
        <Link href={`/dashboard/check-project/${userData._id}`}>
          <Button
            variant={"outline"}
            className="text-backgroundPrimary hover:cursor-pointer hover:opacity-75 active:opacity-50 font-semibold"
          >
            Check Project &gt;&gt;
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DashboardCard;
