import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserProfile, UserRole } from "./types";

const editUserFormSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["admin", "organizer", "moderator", "mentor", "participant"] as const),
});

type EditUserFormValues = z.infer<typeof editUserFormSchema>;

interface EditUserFormProps {
  user: UserProfile;
  onSubmit: (data: EditUserFormValues) => Promise<void>;
  onCancel: () => void;
}

export const EditUserForm = ({ user, onSubmit, onCancel }: EditUserFormProps) => {
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      full_name: user.full_name || "",
      role: user.role as UserRole,
    },
  });

  const userRoles: UserRole[] = ["admin", "organizer", "moderator", "mentor", "participant"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {userRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">Update User</Button>
        </div>
      </form>
    </Form>
  );
};