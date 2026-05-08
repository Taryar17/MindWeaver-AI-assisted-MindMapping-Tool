import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center mb-6">
              <Icons.logo className="h-14 w-14 text-primary" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              About MindWeaver
            </h1>

            <p className="mt-6 text-lg text-muted-foreground">
              MindWeaver is a modern visual thinking platform designed to help
              users organize ideas, build connections between concepts, and
              transform complex thoughts into clear structured knowledge.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-6 pb-20">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-3">
                <Icons.eye className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  To empower people to visualize their thoughts and create
                  meaningful connections between ideas in an intuitive way.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-3">
                <Icons.network className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  We aim to simplify brainstorming, learning, and planning by
                  providing an interactive mind-mapping environment.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-3">
                <Icons.sparkles className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  MindWeaver integrates intelligent features that help users
                  explore ideas faster and generate creative solutions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="container mx-auto px-6 py-20 max-w-4xl">
            <h2 className="text-3xl font-semibold text-center mb-10">
              Our Story
            </h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                MindWeaver was created to help students, researchers, and
                professionals manage complex ideas more effectively. Traditional
                note-taking tools often fail to represent the relationships
                between concepts, which is why visual mind-mapping becomes an
                essential approach for deeper understanding.
              </p>

              <p>
                By combining intuitive node-based interfaces with modern web
                technologies, MindWeaver allows users to create dynamic idea
                structures, explore connections, and expand knowledge networks
                seamlessly.
              </p>

              <p>
                Our goal is to build a tool that encourages creative thinking,
                improves productivity, and helps individuals organize their
                knowledge in a meaningful and visually engaging way.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <h2 className="text-3xl font-semibold text-center mb-12">The Team</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-border bg-card text-center">
              <CardContent className="p-6 space-y-3">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icons.user className="h-8 w-8 text-primary" />
                </div>

                <h3 className="font-semibold">Tar Yar</h3>

                <p className="text-sm text-muted-foreground">Lead Developer</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card text-center">
              <CardContent className="p-6 space-y-3">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icons.users className="h-8 w-8 text-primary" />
                </div>

                <h3 className="font-semibold">Development Team</h3>

                <p className="text-sm text-muted-foreground">
                  Building the next generation of mind-mapping tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card text-center">
              <CardContent className="p-6 space-y-3">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icons.lightbulb className="h-8 w-8 text-primary" />
                </div>

                <h3 className="font-semibold">Community</h3>

                <p className="text-sm text-muted-foreground">
                  Inspired by users who love visual thinking and creativity.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;
