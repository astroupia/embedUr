import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Mail, Twitter, Github, Linkedin } from "lucide-react";

interface FooterLink {
  text: string;
  href: string;
  external?: boolean;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: ReactNode;
  name?: string;
  description?: string;
  columns?: FooterColumnProps[];
  copyright?: string;
  policies?: FooterLink[];
  showModeToggle?: boolean;
  className?: string;
}

const siteConfig = {
  name: "CogniMail",
  url: "https://cognimail.com",
  links: {
    github: "https://github.com/yourusername/cognimail",
    twitter: "https://twitter.com/cognimail",
    linkedin: "https://linkedin.com/company/cognimail"
  },
  description: "AI-Powered Email Marketing Platform"
};

export default function FooterSection({
  name = siteConfig.name,
  description = siteConfig.description,
  columns = [
    {
      title: "Product",
      links: [
        { text: "Features", href: "#features" },
        { text: "Pricing", href: "#pricing" },
        { text: "Templates", href: "#templates" },
        { text: "Integrations", href: "#integrations" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Documentation", href: "/docs" },
        { text: "API Reference", href: "/api" },
        { text: "Guides", href: "/guides" },
        { text: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About Us", href: "/about" },
        { text: "Careers", href: "/careers" },
        { text: "Contact", href: "/contact" },
        { text: "Status", href: "/status" },
      ],
    },
  ],
  copyright = `© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.`,
  policies = [
    { text: "Privacy Policy", href: "/privacy" },
    { text: "Terms of Service", href: "/terms" },
    { text: "Cookie Policy", href: "/cookies" },
  ],
  showModeToggle = true,
  className,
}: FooterProps) {
  return (
    <footer className={cn("bg-background w-full border-t border-border/40 mt-20", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 space-y-4">
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-muted-foreground max-w-md">
              {description}
            </p>
            <div className="flex space-x-4 pt-2">
              <Button variant="outline" size="icon" asChild>
                <Link href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
            </div>
          </div>
          
          {columns.map((column, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wider">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button type="submit" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {copyright}
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            {policies.map((policy, index) => (
              <Link
                key={index}
                href={policy.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {policy.text}
              </Link>
            ))}
            {showModeToggle && <ModeToggle />}
          </div>
        </div>
      </div>
    </footer>
  );
}
