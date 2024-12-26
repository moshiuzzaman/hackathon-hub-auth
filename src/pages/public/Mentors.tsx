import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Linkedin } from "lucide-react";

const Mentors = () => {
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

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Our Mentors</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mentors?.map((mentor) => (
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
                    <div
                      key={stack.technology_stacks.id}
                      className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded-md"
                    >
                      {stack.technology_stacks.name}
                    </div>
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