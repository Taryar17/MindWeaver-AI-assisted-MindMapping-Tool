import { Icons } from "@/components/icons";
import { Link, Form } from "react-router-dom";
import type { User } from "../../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthDropDownProps {
  user?: User;
}

function AuthDropDown({ user }: AuthDropDownProps) {
  const initialName =
    `${user!.firstName?.charAt(0) ?? ""}${
      user!.lastName?.charAt(0) ?? ""
    }`.trim() ||
    user!.email?.slice(-2) ||
    "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="size-8 rounded-full" size="icon">
          <Avatar className="h-8 w-8">
            {user!.avatar ? (
              <AvatarImage
                src={user!.avatar}
                alt={user!.firstName || user!.avatar}
              />
            ) : null}
            <AvatarFallback>{initialName}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1 items-start">
            <p className="text-sm font-medium leading-none">
              {user!.firstName && user!.lastName
                ? `${user!.firstName} ${user!.lastName}`
                : user!.email
                  ? user!.email
                  : "User"}
            </p>
            {user!.email && (
              <p className="text-sm leading-none text-muted-foreground">
                {user!.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            {user!.role === "ADMIN" ? (
              <Link to="/admins" className="w-full cursor-pointer">
                <Icons.dashboard className="size-4 mr-2" />
                Dashboard
                <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
              </Link>
            ) : (
              <Link to="/profile" className="w-full cursor-pointer">
                <Icons.user className="size-4 mr-2" />
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            )}
          </DropdownMenuItem>

          {user!.role === "USER" && (
            <DropdownMenuItem asChild>
              <Link to="/profile/orders" className="w-full cursor-pointer">
                <Icons.package className="size-4 mr-2" />
                My Orders
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Form method="POST" action="/logout" className="w-full">
            <button type="submit" className="w-full text-left">
              <Icons.logout className="size-4 mr-2" />
              Log out
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AuthDropDown;
