import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PublicNavbar = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Learnathon 3.0</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-foreground/60 hover:text-foreground">
            Home
          </Link>
          <Link to="/news" className="text-foreground/60 hover:text-foreground">
            News
          </Link>
          <Link to="/mentors" className="text-foreground/60 hover:text-foreground">
            Mentors
          </Link>
          <Link to="/contact" className="text-foreground/60 hover:text-foreground">
            Contact
          </Link>
          <Link to="/info" className="text-foreground/60 hover:text-foreground">
            Info
          </Link>
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;