"use client";

import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { sendMessageSchema } from "@/schemas/sendMessageSchema";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

interface postDataInterface {
  _id: string;
  username: string;
  email: string;
  keys: { signedUrl: string; key: string; type: string }[];
  isAcceptingMessages: boolean;
  messages: {
    content: string;
    createdAt: string;
  }[];
  title: string;
  description: string;
  githubLink?: string;
  projectLink?: string;
}

export default function checkProjectPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const params = useParams();
  const { postId } = params;

  const [postData, setPostData] = useState<postDataInterface | undefined>(
    undefined
  );
  const [fetching, setFetching] = useState<boolean>(false);

  async function fetchPost() {
    setFetching(true);
    try {
      const result = await axios.get(
        `/api/dashboard/fetch-upload-details?postId=${postId}`
      );

      setPostData(result.data.data);
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Fetch post failed", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchPost();
  }, []);

  const form = useForm<z.infer<typeof sendMessageSchema>>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof sendMessageSchema>) {
    try {
      const result = await axios.post(`/api/dashboard/send-message`, {
        content: values.message,
        postId: postId,
        userId: user._id,
      });

      toast.success("Message sent successfully");

      form.resetField("message");

      fetchPost();
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Failed to send message", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });

      form.resetField("message");
    }
  }

  return (
    <div className="bg-backgroundPrimary">
      <div className="bt-10 text-primaryText p-10 rounded-lg ">
        {postData ? (
          <div>
            <h1 className="text-xl font-semibold">
              <span className="text-secondaryText">Username: </span>
              {postData.username}
            </h1>

            <h2 className="text-md mt-10">
              <span className="text-secondaryText">Title: </span>
              {postData.title}
            </h2>

            <h2 className="text-md ">
              <span className="text-secondaryText">Description: </span>
              <br />
              {postData.description}
            </h2>

            {postData.githubLink ? (
              <h2 className="text-md ">
                <span className="text-secondaryText">Github Link: </span>
                <br />
                {postData.githubLink}
              </h2>
            ) : (
              ""
            )}

            {postData.projectLink ? (
              <h2 className="text-md ">
                <span className="text-secondaryText">Project Link: </span>
                <br />
                {postData.projectLink}
              </h2>
            ) : (
              ""
            )}

            <div className="w-full flex flex-wrap gap-3 mt-10">
              {postData.keys.map((imageObj, index) => (
                <>
                  {imageObj && imageObj.type.includes("image") && (
                    <img
                      key={index}
                      src={imageObj.signedUrl}
                      alt={imageObj.key}
                      className="w-[18rem] h-[18rem] cover-object rounded-lg"
                    />
                  )}

                  {imageObj && imageObj.type.includes("video") && (
                    <video
                      className="w-[18rem] h-[18rem] rounded-lg object-cover"
                      src={imageObj.signedUrl}
                      autoPlay
                      loop
                      muted
                      controls
                      controlsList="nodownload"
                    />
                  )}
                </>
              ))}
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 mt-10 "
              >
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl">
                        Type your message:
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please send your thought on this project"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant={"outline"}
                  className="text-backgroundPrimary text-md font-semibold hover:cursor-pointer active:opacity-50 hover:opacity-75"
                  type="submit"
                  disabled={!postData.isAcceptingMessages}
                >
                  Send Message
                </Button>{" "}
                {!postData.isAcceptingMessages ? (
                  <>
                    <span className="text-red-500 text-xl">
                      &#40; User is currently not accepting messages &#41;
                    </span>
                  </>
                ) : (
                  ""
                )}
              </form>
            </Form>

            {postData && postData.messages.length > 0 ? (
              <>
                <h1 className="text-xl text-secondaryText py-10 text-center">
                  Please find project messages below:
                </h1>
                <div className="w-full h-[20rem] flex flex-col gap-3 overflow-auto">
                  {postData.messages.map((message, index) => {
                    let date = new Date(message.createdAt);
                    let displayDate = `${date.getDate()}-${date.getMonth().toString().padStart(2, "0")}-${date.getFullYear()} ${date.getHours().toString().padStart(2, ")")}:${date.getMinutes().toString().padStart(2, "0")}`;

                    return (
                      <div
                        key={index}
                        className="w-full py-4 rounded-lg bg-cardColor p-4"
                      >
                        <p className="text-secondaryText text-sm">
                          {displayDate}
                        </p>
                        <p className="text-primaryText mt-4">
                          {message.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <p className="text-xl text-secondaryText py-10 text-center">
                  No messages on this project
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold">
              {fetching
                ? "Please wait fetching details"
                : `Details are not found, please try later`}
            </h1>
          </>
        )}
      </div>
    </div>
  );
}
