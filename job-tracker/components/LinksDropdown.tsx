import React from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { AlignLeft } from "lucide-react";
import links from "@/utils/links";
import Link from "next/link";

const LinksDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="lg:hidden">
        <Button variant="outline" size="icon">
          <AlignLeft />
          <span className="sr-only">Toggle Links</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-52 lg:hidden"
        align="start"
        sideOffset={25}
      >
        {links.map((link) => (
          <DropdownMenuItem key={link.href}>
            <Link href={link.href} className="flex items-center gap-x-2">
              {link.icon} <span className="capitalize">{link.label}</span>
            </Link>
            
          </DropdownMenuItem>
        ))}
        </DropdownMenuContent>  
    </DropdownMenu>
  );
};

export default LinksDropdown;
