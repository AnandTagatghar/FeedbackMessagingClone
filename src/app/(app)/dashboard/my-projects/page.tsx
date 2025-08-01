"use client";

import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import z from "zod";
import { addFilesToPostSchema } from "@/schemas/addFilesToPostSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface allPostsDataInterface {
  _id: string;
  username: string;
  email: string;
  keys: { key: string; ref: string }[];
  isAcceptingMessages: boolean;
  messages: {
    content: string;
    createdAt: string;
  }[];
  title: string;
  description: string;
  githubLink?: string;
  projectLink?: string;
  createdAt: Date;
}

export default function myProjectsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [fetchingAllPosts, setFetchingAllPosts] = useState<boolean>(false);
  const [allPosts, setAllPosts] = useState<allPostsDataInterface[]>([]);

  const [open, setOpen] = useState<boolean>(false);
  const [addFilesFormSubmitting, setAddFilesFormSubmitting] =
    useState<boolean>();

  async function fetchAllPosts() {
    setFetchingAllPosts(true);
    try {
      const result = await axios.get(
        `/api/dashboard/get-my-projects?userId=${user._id}`
      );

      setAllPosts(result.data.data.posts);
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Failed to load posts", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });
    } finally {
      setFetchingAllPosts(false);
    }
  }

  useEffect(() => {
    fetchAllPosts();
  }, [user]);

  async function handleRemoveKey(key: string, postId: string) {
    console.log(`delete button hitted`);
    try {
      await axios.delete("/api/dashboard/delete-key-from-post", {
        data: {
          key,
          postId,
        },
      });

      toast.success("Card deleted successfully");

      fetchAllPosts();
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Deleting card unsuccessful", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });
    }
  }

  const form = useForm<z.infer<typeof addFilesToPostSchema>>({
    resolver: zodResolver(addFilesToPostSchema),
  });

  const handleSubmit = async (
    data: z.infer<typeof addFilesToPostSchema>,
    id: string | number
  ) => {
    setAddFilesFormSubmitting(true);
    try {
      if (!data.files || data.files.length == 0) {
        throw new Error(`Accepting atleast 1 file`);
      }

      const uploadedKeys: string[] = [];

      for (let file of Array.from(data.files)) {
        const result = await axios.get(`/api/dashboard/get-upload-url`, {
          params: {
            fileType: file.type,
            fileName: file.name,
          },
        });

        const { signedUrl, key } = result.data.data;

        await fetch(signedUrl, {
          method: "put",
          headers: { "Content-Typ": file.type },
          body: file,
        });

        uploadedKeys.push(key);
      }

      await axios.patch("/api/dashboard/add-my-project-files", {
        keys: uploadedKeys,
        postId: id,
      });

      toast.success("Upload files success");

      fetchAllPosts();
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Failed to upload Files", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });
    } finally {
      setOpen(false);
      setAddFilesFormSubmitting(false);
    }
  };

  return (
    <div className=" bg-backgroundPrimary p-15">
      {allPosts.length > 0 ? (
        <>
          <h1 className="text-secondaryText font-semibold text-3xl pb-10">
            Please find all your posts below:
          </h1>

          {allPosts.map((postData, index) => {
            let dateTime = new Date(postData.createdAt);

            let displayDateTime = `${dateTime.getDate().toString().padStart(2, "0")}-${dateTime.getMonth().toString().padStart(2, "0")}-${dateTime.getFullYear().toString().padStart(2, "0")} ${dateTime.getHours().toString().padStart(2, "0")}:${dateTime.getMinutes().toString().padStart(2, "0")}`;
            return (
              <div
                className="bt-10 text-primaryText p-10 rounded-lg border-2 border-primaryText"
                key={index}
              >
                {postData && (
                  <div>
                    <h1 className="text-md font-semibold">
                      <span className="text-secondaryText">Created Time: </span>
                      {displayDateTime}
                    </h1>

                    <h2 className="text-md">
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
                        <span className="text-secondaryText">
                          Github Link:{" "}
                        </span>
                        <br />
                        {postData.githubLink}
                      </h2>
                    ) : (
                      ""
                    )}
                    {postData.projectLink ? (
                      <h2 className="text-md ">
                        <span className="text-secondaryText">
                          Project Link:{" "}
                        </span>
                        <br />
                        {postData.projectLink}
                      </h2>
                    ) : (
                      ""
                    )}

                    <div className="w-full flex flex-wrap gap-3 mt-10">
                      {postData.keys.map((obj, index) => {
                        return (
                          <HoverCard key={index}>
                            <HoverCardTrigger asChild>
                              <img
                                src={obj.ref}
                                alt={obj.key}
                                className="w-[18rem] h-[18rem] cover-object rounded-lg"
                              />
                            </HoverCardTrigger>

                            <HoverCardContent className="flex gap-3 w-[6rem]">
                              <Pencil className="hover:opacity-75 active:opacity-50 hover:cursor-pointer" />

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Trash2 className="hover:opacity-75 active:opacity-50 hover:cursor-pointer" />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this card data from our
                                      servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => {
                                        handleRemoveKey(obj.key, postData._id);
                                      }}
                                    >
                                      Yes, please remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </HoverCardContent>
                          </HoverCard>
                        );
                      })}

                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div
                                itemType="button"
                                className="bg-primaryText rounded-full p-2 text-2xl text-backgroundPrimary font-semibold hover:opacity-75 hover:cursor-pointer active:opacity-50 w-[2.5rem] h-[2.5rem] text-[2rem] self-center"
                                onClick={() => {
                                  setOpen(true);
                                }}
                              >
                                <Plus />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-[11rem]">
                              Add images
                            </HoverCardContent>
                          </HoverCard>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Please submit your files:</DialogTitle>
                          </DialogHeader>

                          <Form {...form}>
                            <form
                              onSubmit={form.handleSubmit((data) =>
                                handleSubmit(data, postData._id)
                              )}
                              className="space-y-4"
                            >
                              <FormItem>
                                <FormLabel>Upload Files:</FormLabel>
                                <FormControl>
                                  <Input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                      if (!e.target.files) {
                                        return;
                                      }
                                      form.setValue("files", e.target.files);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>

                              <DialogFooter>
                                <Button
                                  className="hover:opacity-75 hover:cursor-pointer active:opacity-50"
                                  type="submit"
                                  disabled={addFilesFormSubmitting}
                                >
                                  {addFilesFormSubmitting ? (
                                    <>
                                      <Loader2 className="animate-apin" />
                                      Please wait
                                    </>
                                  ) : (
                                    <>Submit</>
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {postData && postData.messages.length > 0 ? (
                      <>
                        <h1 className="text-xl text-secondaryText py-10 text-center">
                          Please find project messages below
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
                )}
              </div>
            );
          })}
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold text-primaryText">
            {fetchingAllPosts
              ? "Please wait fetching details"
              : `Details are not found, please try later`}
          </h1>
        </>
      )}
    </div>
  );
}
