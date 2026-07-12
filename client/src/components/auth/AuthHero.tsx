import { Truck } from "lucide-react";

const features = [
  {
    color: "bg-primary",
    text: "Real-time fleet tracking & dispatch",
  },
  {
    color: "bg-green-500",
    text: "Driver safety scoring & compliance",
  },
  {
    color: "bg-blue-500",
    text: "Predictive maintenance scheduling",
  },
  {
    color: "bg-purple-500",
    text: "Operational cost analytics & ROI",
  },
];

const roles = [
  "Fleet Manager",
  "Dispatcher",
  "Safety Officer",
  "Financial Analyst",
];

export const AuthHero = () => {
  return (
    <div className="hidden h-screen border-r border-border bg-background lg:flex lg:flex-col">
      <div className="flex flex-1 flex-col justify-center px-14">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Truck
              size={24}
              strokeWidth={2.2}
              className="text-primary-foreground"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">TransitOps</h1>

            <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
              Fleet Intelligence Platform
            </p>
          </div>
        </div>

        <div className="mt-14 max-w-xl">
          <h2 className="text-5xl font-bold leading-tight text-foreground xl:text-6xl">
            Smarter fleet.
          </h2>

          <h2 className="text-5xl font-bold leading-tight text-primary xl:text-6xl">
            Fewer surprises.
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Complete visibility across your entire transport operation—from
            dispatch to delivery, maintenance to compliance.
          </p>

          <div className="mt-10 space-y-5">
            {features.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-4 text-lg text-foreground"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${feature.color}`} />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border px-14 py-8">
        <p className="mb-5 text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Supported Roles
        </p>

        <div className="flex flex-wrap gap-3">
          {roles.map((role) => (
            <div
              key={role}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
            >
              {role}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
