import { Link } from "react-router-dom";
import { Icons } from "@/components/icons";

function HomePage() {
  return (
    <div className="flex flex-col gap-24 max-w-7xl mx-auto">
      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center gap-6 pt-8">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Icons.logo className="size-7" />
          <span className="text-lg">MindWeaver</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Organize Your Ideas Visually
        </h1>

        <p className="max-w-2xl text-muted-foreground text-lg">
          Transform scattered thoughts into structured mind maps. Brainstorm,
          connect ideas, and build clarity faster with an intuitive visual
          workspace.
        </p>

        <div className="flex gap-4 mt-4">
          <Link
            to="/canva"
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            Start Creating
          </Link>

          <Link
            to="/aboutus"
            className="px-6 py-3 rounded-lg border border-border text-muted-foreground hover:bg-muted transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Icons.work className="size-6 text-primary" />}
          title="Visual Mind Mapping"
          text="Create nodes and connect ideas to build clear visual structures of your thoughts."
        />

        <FeatureCard
          icon={<Icons.stack className="size-6 text-primary" />}
          title="Flexible Customization"
          text="Change colors, shapes, and styles to categorize and highlight important ideas."
        />

        <FeatureCard
          icon={<Icons.doc className="size-6 text-primary" />}
          title="Export Notes"
          text="Convert your mind maps into structured notes for sharing or documentation."
        />
      </section>

      {/* HOW IT WORKS */}
      <section className="flex flex-col gap-10 text-center">
        <h2 className="text-3xl font-bold">How MindWeaver Works</h2>

        <div className="grid md:grid-cols-3 gap-10">
          <Step
            number="1"
            title="Start with an Idea"
            text="Create your main node and begin mapping your central concept."
          />

          <Step
            number="2"
            title="Expand Your Thoughts"
            text="Add child nodes to break down ideas and explore connections."
          />

          <Step
            number="3"
            title="Refine and Organize"
            text="Move, edit, and customize nodes to structure your knowledge visually."
          />
        </div>
      </section>

      {/* USE CASES */}
      <section className="flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-center">
          Perfect for Many Workflows
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          <UseCase
            title="Students"
            text="Plan essays and organize study topics."
          />
          <UseCase
            title="Developers"
            text="Design system architecture and features."
          />
          <UseCase
            title="Researchers"
            text="Map relationships between ideas and theories."
          />
          <UseCase
            title="Teams"
            text="Brainstorm and visualize collaborative ideas."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center text-center gap-6 pb-10">
        <h2 className="text-3xl font-bold">
          Start Building Your Mind Maps Today
        </h2>

        <p className="text-muted-foreground max-w-xl">
          Whether you're brainstorming ideas, studying complex topics, or
          planning projects, MindWeaver helps transform thoughts into visual
          clarity.
        </p>

        <Link
          to="/canva"
          className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
        >
          Create Your First Mind Map
        </Link>
      </section>
    </div>
  );
}

export default HomePage;

/* COMPONENTS  */

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-border rounded-xl p-6 bg-card hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
        {number}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{text}</p>
    </div>
  );
}

function UseCase({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-border rounded-lg p-5 bg-card text-center">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
