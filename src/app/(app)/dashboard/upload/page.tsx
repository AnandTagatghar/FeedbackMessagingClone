"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { uploadPostSchema } from "@/schemas/uploadPostSchema";
import z from "zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const UploadPage = () => {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof uploadPostSchema>>({
    resolver: zodResolver(uploadPostSchema),
    defaultValues: {
      title: "",
      description: "",
      files: null,
    },
  });

  async function onSubmit(values: z.infer<typeof uploadPostSchema>) {
    setIsSubmitting(true);
    try {
      if (!values.files || values.files.length == 0) {
        throw new Error(`Please select atleast one file`);
      }

      const uploadedUrls = [];

      for (let file of values.files) {
        const response = await axios.get(`/api/dashboard/get-upload-url`, {
          params: {
            fileName: file.name,
            fileType: file.type,
          },
        });

        const { signedUrl, key } = response.data.data;

        await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        uploadedUrls.push({ key, type: file.type });
      }

      const result = await axios.post("/api/dashboard/upload-post", {
        title: values.title,
        description: values.description,
        fileKeys: uploadedUrls,
        githubLink: values.githubLink,
        projectLink: values.projectLink,
      });

      toast.success("Upload post success", {
        description: result.data.message || "",
      });

      router.replace("/dashboard");
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error("Upload post failed", {
        description:
          axiosError?.response?.data.message ||
          error.message ||
          `Something went wrong`,
      });

      form.resetField("title");
      form.resetField("files");
      form.resetField("description");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-w-screen min-h-[calc(100vh-120px)] bg-backgroundPrimary flex justify-center items-center">
      <div className="bg-cardColor p-10 rounded-lg text-primaryText">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please write your title here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please write your description here"
                      className="resize-none w-[30rem]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Upload Files:</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => {
                    form.setValue("files", e.target.files);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="githubLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Github Link:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please write your github link here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Project Link{" "}
                    <span className="text-secondaryText">
                      &#40;If any thing on live&#41;
                    </span>
                    :
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please write your github link here"
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Please wait
                </>
              ) : (
                <>Upload post</>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UploadPage;
