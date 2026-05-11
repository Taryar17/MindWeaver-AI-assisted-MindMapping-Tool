import {
  Card,
  //CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Icons } from "@/components/icons";
import Footer from "@/components/layouts/Footer";

function Error() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <main className="mx-auto my-32 flex flex-1 items-center">
        <Card className="w-87.5 md:w-125 lg:w-125">
          <CardHeader className="place-items-center gap-2">
            <div className="border-muted-foreground/70 mt-2 mb-4 grid size-24 place-items-center rounded-full border border-dashed">
              <Icons.exclamation
                className="text-muted-foreground/70 size-10"
                aria-hidden="true"
              />
            </div>
            <CardTitle>Oops!</CardTitle>
            <CardDescription>An error occurs accidently.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/">Go to Home Page</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default Error;
