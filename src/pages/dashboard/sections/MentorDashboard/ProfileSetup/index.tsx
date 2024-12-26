import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const formSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  photo_url: z.string().min(1, "Photo is required"),
  linkedin_username: z.string().min(1, "LinkedIn username is required"),
  github_username: z.string().min(1, "GitHub username is required"),
});

type FormData = z.infer<typeof formSchema>;

const ProfileSetup = ({ profile }: { profile: any }) => {
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      photo_url: profile?.photo_url || "",
      linkedin_username: profile?.linkedin_username || "",
      github_username: profile?.github_username || "",
    },
  });

  useEffect(() => {
    const calculateProgress = () => {
      const fields = ["full_name", "photo_url", "linkedin_username", "github_username"];
      const filledFields = fields.filter(field => !!form.getValues(field));
      setProgress((filledFields.length / fields.length) * 100);
    };

    calculateProgress();
    form.watch(calculateProgress);
  }, [form]);

  const handlePhotoUpload = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${profile.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("mentor-photos")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Error uploading photo");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("mentor-photos")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const validateSocialProfiles = async (data: FormData) => {
    // Here you would implement the actual validation logic
    // For now, we'll just simulate the validation
    return true;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const isValid = await validateSocialProfiles(data);
      if (!isValid) {
        toast.error("Invalid social profiles");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          mentor_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Profile submitted for approval");
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground">
          Profile completion: {Math.round(progress)}%
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="photo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Photo</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {field.value && (
                      <img
                        src={field.value}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handlePhotoUpload(file);
                          if (url) field.onChange(url);
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedin_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="github_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting || progress < 100}
            className="w-full"
          >
            Submit for Approval
          </Button>
        </form>
      </Form>

      {profile.mentor_status === "rejected" && (
        <div className="p-4 border border-destructive rounded-md">
          <h3 className="font-semibold text-destructive">Profile Rejected</h3>
          <p className="text-sm mt-1">{profile.rejection_reason}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;