import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Mental Math Mastery
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Train your mental math skills with proven calculation methods.
          Master distributive property, difference of squares, and more.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/practice"
            className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Practice
          </Link>
          <Link
            href="/study"
            className="rounded-lg border border-border bg-card px-6 py-3 font-medium text-card-foreground transition-colors hover:bg-secondary"
          >
            Study Methods
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            title="6 Calculation Methods"
            description="Learn proven techniques like distributive property, difference of squares, and near-100 method."
          />
          <FeatureCard
            title="Adaptive Practice"
            description="Problems tailored to your skill level with increasing difficulty as you improve."
          />
          <FeatureCard
            title="Track Progress"
            description="Monitor your accuracy, speed, and identify areas for improvement."
          />
        </div>
      </main>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-left">
      <h3 className="mb-2 font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
