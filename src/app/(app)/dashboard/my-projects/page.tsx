"use client";

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
import { editFileSchema } from "@/schemas/editFileSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import axios, { AxiosError } from "axios";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { addFilesToPostSchema } from "@/schemas/addFilesToPostSchema";

interface allPostsIdsInterface {
  _id: string;
}

export default function myProjectPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [postIds, setPostIds] = useState<allPostsIdsInterface[]>([]);
  const [fetchingAllPostsIds, setFetchingAllPostsIds] =
    useState<boolean>(false);

  async function fetchPostsIds() {
    setFetchingAllPostsIds(true);
    try {
      const result = await axios.get(
        `/api/dashboard/fetch-my-projects-all-post-ids?userId=${user._id}`
      );

      setPostIds(result.data.data.postsId);
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Failed to load posts", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });
    } finally {
      setFetchingAllPostsIds(false);
    }
  }

  useEffect(() => {
    fetchPostsIds();
  }, [user]);

  return (
    <div className="min-w-screen min-h-[86vh] bg-backgroundPrimary p-10">
      {fetchingAllPostsIds && (
        <>
          <h1 className="text-primaryText text-2xl font-semibold">
            Please wait it&apos;s it&apos;s loading
          </h1>
        </>
      )}

      {!fetchingAllPostsIds && postIds.length == 0 && (
        <>
          <h1 className="text-primaryText text-2xl font-semibold">
            No Post&apos;s found, please upload first.
          </h1>
        </>
      )}

      <div className="flex gap-4 flex-col w-full">
        {!fetchingAllPostsIds && postIds.length > 0 && (
          <>
            {postIds.map((postId) => {
              return <SinglePost postId={postId._id} key={postId._id} />;
            })}
          </>
        )}
      </div>
    </div>
  );
}

interface singlePostDataInterface {
  _id: string;
  username: string;
  email: string;
  keys: { key: string; signedUrl: string }[];
  isAcceptingMessages: boolean;
  messages: {
    content: string;
    createdAt: string;
  }[];
  title: string;
  description: string;
  githubLink?: string;
  projectLink?: string;
  createdAt: string;
}

function SinglePost({ postId }: { postId: string }) {
  const [fetchingPostData, setFetchingPostData] = useState<boolean>(false);

  const [postData, setPostData] = useState<singlePostDataInterface | null>(
    null
  );

  const [isAddSubmitting, setIsAddSubmitting] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const [isEditSubmitting, setIsEditSubmitting] = useState<boolean>(false);

  const fetchSinglePostData = async () => {
    setFetchingPostData(true);
    try {
      const result = await axios.get(
        `/api/dashboard/fetch-my-project-single-post-data?postId=${postId}`
      );

      setPostData(result.data.data.postIdData);
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error(
        `Post ID: ${postId}, Error: ${axiosError.response?.data.message || error.message || "Something went wrong"}`
      );
    } finally {
      setFetchingPostData(false);
    }
  };

  useEffect(() => {
    fetchSinglePostData();
  }, [postId]);

  const handleDeleteKey = useCallback(async (key: string, postId: string) => {
    try {
      await axios.delete(`/api/dashboard/delete-uploaded-key`, {
        params: {
          key,
        },
      });

      await axios.patch("/api/dashboard/delete-key-from-post", {
        key,
        postId,
      });

      toast.success("Card deleted successfully");
      fetchSinglePostData();
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Deleting card unsuccessful", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });
    }
  }, []);

  const handleAddFilesSubmit = async (
    data: z.infer<typeof addFilesToPostSchema>,
    postId: string
  ) => {
    setIsAddSubmitting(true);
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
        postId: postId,
      });

      toast.success("Upload files success");

      fetchSinglePostData();
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Failed to upload Files", {
        description:
          axiosError.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });
    } finally {
      setIsAddSubmitting(false);
      setIsAddDialogOpen(false);
    }
  };

  const handleEditKey = useCallback(
    async (
      values: z.infer<typeof editFileSchema>,
      postId: string,
      key: string,
      closeDialog: () => void
    ) => {
      setIsEditSubmitting(true);
      try {
        if (!values.file || values.file == undefined) {
          throw new Error("Please select file");
        }

        let file: any = Array.from(values.file);
        file = file[0];

        const result = await axios.get(
          `/api/dashboard/get-upload-url?fileName=${file.name}&fileType=${file.type}`
        );

        const { signedUrl, key: fetchedKeyValue } = result.data.data;

        await fetch(signedUrl, {
          method: "put",
          body: file,
          headers: {
            "Content-type": file.type,
          },
        });

        await axios.delete(`/api/dashboard/delete-uploaded-key?key=${key}`);

        await axios.patch("/api/dashboard/delete-key-from-post", {
          key: key,
          postId,
        });

        await axios.patch("/api/dashboard/add-my-project-files", {
          keys: [fetchedKeyValue],
          postId: postId,
        });

        toast.success(`Edit file success`);

        fetchSinglePostData();
      } catch (error: any) {
        const axiosError = error as AxiosError<ApiResponse>;

        toast.error("Failed to edit file", {
          description:
            axiosError.response?.data.message ||
            error.message ||
            `Something went wrong`,
        });
      } finally {
        closeDialog();
        setIsEditSubmitting(false);
      }
    },
    []
  );

  return (
    <>
      {postData && (
        <div className="bt-10 text-primaryText p-10 rounded-lg border-2 border-primaryText">
          <h1 className="text-md font-semibold">
            <span className="text-secondaryText">Created Time: </span>
            {postData.createdAt}
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
              <span className="text-secondaryText">Github Link: </span>
              <br />
              {postData.githubLink}
            </h2>
          ) : (
            ""
          )}

          {postData.projectLink && (
            <h2 className="text-md ">
              <span className="text-secondaryText">Project Link: </span>
              <br />
              {postData.projectLink}
            </h2>
          )}

          {postData.keys.length > 0 && (
            <>
              <h1 className="text-xl text-secondaryText mt-10">
                Please find your uploaded files below:
              </h1>
            </>
          )}

          {postData.keys.length == 0 && (
            <>
              <h1 className="text-xl text-secondaryText mt-10">
                No files are available, please click below button to add files:
              </h1>
            </>
          )}

          <div className="flex flex-wrap gap-3 w-full px-10 mt-10">
            {postData.keys.map((obj, index) => {
              return (
                <ImageCard
                  key={index}
                  imgRef={obj.signedUrl}
                  keyValue={obj.key}
                  postId={postId}
                  handleDeleteKey={handleDeleteKey}
                  handleEditKey={handleEditKey}
                  isEditSubmitting={isEditSubmitting}
                />
              );
            })}

            <AddFilesAction
              isAddSubmitting={isAddSubmitting}
              isAddDialogOpen={isAddDialogOpen}
              setIsAddDialogOpen={setIsAddDialogOpen}
              handleAddFilesSubmit={handleAddFilesSubmit}
              postId={postId}
            />
          </div>
        </div>
      )}
    </>
  );
}

function ImageCard({
  imgRef,
  keyValue,
  postId,
  handleDeleteKey,
  handleEditKey,
  isEditSubmitting,
}: {
  imgRef: string;
  keyValue: string;
  postId: string;
  handleDeleteKey: (key: string, postId: string) => void;
  handleEditKey: (
    values: z.infer<typeof editFileSchema>,
    postId: string,
    key: string,
    closeDialog: () => void
  ) => Promise<void>;
  isEditSubmitting: boolean;
}) {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const editForm = useForm<z.infer<typeof editFileSchema>>({
    resolver: zodResolver(editFileSchema),
  });

  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          <img
            src={imgRef}
            alt={keyValue}
            className="w-[18rem] h-[18rem] cover-object rounded-lg"
          />
        </HoverCardTrigger>

        <HoverCardContent className="flex gap-3 w-[6rem]">
          <div
            itemType="button"
            className=" hover:opacity-75 hover:cursor-pointer active:opacity-50"
            onClick={() => {
              setIsEditOpen(true);
            }}
          >
            <Pencil />
          </div>

          <AlertDialog>
            <AlertDialogTrigger>
              <Trash2 className="hover:opacity-75 active:opacity-50 hover:cursor-pointer" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this card data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    handleDeleteKey(keyValue, postId);
                  }}
                >
                  Yes, please remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </HoverCardContent>
      </HoverCard>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Please edit your file:</DialogTitle>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) =>
                handleEditKey(data, postId, keyValue, () => {
                  setIsEditOpen(false);
                })
              )}
              className="space-y-4"
            >
              <FormItem>
                <FormLabel>Upload Files:</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (!e.target.files) {
                        return;
                      }
                      editForm.setValue("file", e.target.files);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <DialogFooter>
                <Button
                  className="hover:opacity-75 hover:cursor-pointer active:opacity-50"
                  type="submit"
                  disabled={isEditSubmitting}
                >
                  {isEditSubmitting ? (
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
    </>
  );
}

function AddFilesAction({
  isAddSubmitting,
  isAddDialogOpen,
  setIsAddDialogOpen,
  handleAddFilesSubmit,
  postId,
}: {
  isAddSubmitting: boolean;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddFilesSubmit: (
    data: z.infer<typeof addFilesToPostSchema>,
    postId: string
  ) => Promise<void>;
  postId: string;
}) {
  const addFilesForm = useForm<z.infer<typeof addFilesToPostSchema>>({
    resolver: zodResolver(addFilesToPostSchema),
  });

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <HoverCard>
          <HoverCardTrigger asChild>
            <div
              itemType="button"
              className="bg-primaryText rounded-full p-2 text-2xl text-backgroundPrimary font-semibold hover:opacity-75 hover:cursor-pointer active:opacity-50 w-[2.5rem] h-[2.5rem] text-[2rem] self-center"
              onClick={() => {
                setIsAddDialogOpen(true);
              }}
            >
              <Plus />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-[11rem]">Add images</HoverCardContent>
        </HoverCard>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Please submit your files:</DialogTitle>
        </DialogHeader>

        <Form {...addFilesForm}>
          <form
            onSubmit={addFilesForm.handleSubmit((data) =>
              handleAddFilesSubmit(data, postId)
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
                    addFilesForm.setValue("files", e.target.files);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <DialogFooter>
              <Button
                className="hover:opacity-75 hover:cursor-pointer active:opacity-50"
                type="submit"
                disabled={isAddSubmitting}
              >
                {isAddSubmitting ? (
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
  );
}

function MessageCard(){
  return <>This is a message one</>
}