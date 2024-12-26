import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const { data: homeSettings } = useQuery({
    queryKey: ["home-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_page_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: partners } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("display_order", { ascending: true });
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

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            {homeSettings?.hero_title || "Welcome to Learnathon 3.0"}
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            {homeSettings?.hero_subtitle || "Developing the next generation of job-ready tech professionals"}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="container px-4">
        <div className="mx-auto max-w-[800px] space-y-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            About Learnathon 3.0
          </h2>
          <p className="text-gray-500 md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed dark:text-gray-400">
            Learnathon, created by Geeky Solutions, is dedicated to developing the next generation of job-ready tech professionals. 
            We offer an immersive, mentorship-driven experience to equip you with the technical and professional skills demanded by today's job market.
          </p>
          <p className="text-gray-500 md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed dark:text-gray-400">
            Through real-time projects, collaborative work, and expert guidance, we aim to help you bridge the gap between academic knowledge and industry expectations.
          </p>
        </div>
      </section>

      {/* Technology Stacks */}
      {stacks && stacks.length > 0 && (
        <section className="container px-4">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">Technology Stacks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stacks.map((stack) => (
              <div key={stack.id} className="flex flex-col items-center p-4 border rounded-lg">
                <img src={stack.icon} alt={stack.name} className="w-12 h-12 mb-2" />
                <span className="text-sm font-medium">{stack.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Partners */}
      {partners && partners.length > 0 && (
        <section className="container px-4">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">Our Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {partners.map((partner) => (
              <a
                key={partner.id}
                href={partner.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4"
              >
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="max-w-[120px] max-h-[60px] object-contain"
                />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;