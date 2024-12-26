import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Linkedin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Mentors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStack, setSelectedStack] = useState<string | null>(null);

  const { data: mentors } = useQuery({
    queryKey: ["approved-mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          mentor_stacks (
            technology_stacks (*)
          )
        `)
        .eq("role", "mentor")
        .eq("mentor_status", "approved");
      if (error) throw error;
      return data;
    },
  });

  const { data: stacks } = useQuery({
    queryKey: ["technology-stacks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technology_stacks")
        .select("*")
        .eq("is_enabled", true);
      if (error) throw error;
      return data;
    },
  });

  const filteredMentors = mentors?.filter((mentor) => {
    const matchesSearch = mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStack = selectedStack
      ? mentor.mentor_stacks?.some(
          (stack: any) => stack.technology_stacks.id === selectedStack
        )
      : true;
    return matchesSearch && matchesStack;
  });

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Our Mentors</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search mentors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {stacks?.map((stack) => (
            <Badge
              key={stack.id}
              variant={selectedStack === stack.id ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() =>
                setSelectedStack(selectedStack === stack.id ? null : stack.id)
              }
            >
              {stack.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors?.map((mentor) => (
          <div key={mentor.id} className="p-6 border rounded-lg space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={mentor.photo_url} />
                <AvatarFallback>{mentor.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg">{mentor.full_name}</h3>
                <div className="flex gap-2 mt-2">
                  {mentor.github_username && (
                    <a
                      href={`https://github.com/${mentor.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {mentor.linkedin_username && (
                    <a
                      href={`https://linkedin.com/in/${mentor.linkedin_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {mentor.mentor_stacks && mentor.mentor_stacks.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Technology Stacks</h4>
                <div className="flex flex-wrap gap-2">
                  {mentor.mentor_stacks.map((stack: any) => (
                    <Badge
                      key={stack.technology_stacks.id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSelectedStack(stack.technology_stacks.id)}
                    >
                      {stack.technology_stacks.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mentors;