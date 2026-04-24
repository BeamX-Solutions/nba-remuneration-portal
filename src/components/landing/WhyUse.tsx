import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Instant document generation with accurate legal language",
  "Secure document storage tied to your NBA profile",
  "Administrative oversight and compliance tracking",
  "Accessible from any device, any branch",
  "Email notifications for every status change",
  "Full version history for every document prepared",
];

const WhyUse = () => (
  <section className="py-16 sm:py-24 lg:py-32 bg-parchment">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-start">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 sm:w-12 bg-accent" />
            <span className="text-[12px] tracking-eyebrow uppercase text-accent font-semibold">Why Choose Us</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-display text-primary font-light leading-[1.05] mb-5">
            Built around
            <br />
            <em className="italic font-normal text-accent">your practice.</em>
          </h2>
          <div className="h-px w-16 bg-accent/50 mb-6" />
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Designed specifically for NBA members, the portal eliminates manual paperwork and ensures every document is prepared to the correct legal standard with full committee oversight.
          </p>
        </div>

        <div className="space-y-2.5">
          {benefits.map((b, i) => (
            <div
              key={b}
              className="flex items-start gap-3 p-3.5 sm:p-5 rounded-sm bg-background border border-border/60 shadow-sm transition-elegant hover:shadow-soft hover:border-accent/20"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
              </div>
              <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default WhyUse;
