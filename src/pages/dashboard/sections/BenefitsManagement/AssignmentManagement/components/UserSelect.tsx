import { Check, Users } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { User } from "../types";

interface UserSelectProps {
  form: UseFormReturn<any>;
  users: User[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
}

export const UserSelect = ({ form, users = [], selectedUsers = [], onUserSelect }: UserSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="userIds"
      render={() => (
        <FormItem>
          <FormLabel>Select Users</FormLabel>
          <FormControl>
            <Command className="border rounded-md">
              <CommandInput placeholder="Search users..." />
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup className="max-h-40 overflow-y-auto">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => onUserSelect(user.id)}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      {user.full_name || user.id}
                    </div>
                    {selectedUsers.includes(user.id) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </FormControl>
        </FormItem>
      )}
    />
  );
};