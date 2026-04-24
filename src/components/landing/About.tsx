import { Shield, Scale, Users } from "lucide-react";
import lawyersImg from "@/assets/dragon-white-munthe-Bh6u25Qv9qA-unsplash.jpg";

const About = () => (
  <section id="about" className="py-16 sm:py-24 lg:py-32 bg-parchment">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-20 items-center">
        {/* Image */}
        <div className="relative">
          {/* Constrained image frame */}
          <div className="relative overflow-hidden rounded-sm shadow-elegant aspect-[4/3] sm:aspect-[16/11]">
            <img
              src={lawyersImg}
              alt="NBA legal practitioners"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
            {/* Bottom gradient so the stat card reads cleanly */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Floating stat card */}
          <div className="absolute bottom-4 right-4 lg:-bottom-8 lg:-right-12 bg-background border-t-2 border-accent rounded-sm shadow-elegant p-4 sm:p-5 max-w-[165px] sm:max-w-[200px]">
            <p className="font-display text-3xl sm:text-4xl font-bold text-primary">
              100<span className="text-accent">%</span>
            </p>
            <p className="text-[10px] tracking-eyebrow uppercase text-muted-foreground mt-1 font-semibold">
              Compliance Tracked
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-snug">
              Every document prepared and approved with a full digital audit trail.
            </p>
          </div>

          {/* Decorative quote mark */}
          <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 font-display text-[7rem] sm:text-[10rem] text-accent/20 leading-none select-none pointer-events-none">
            "
          </div>
        </div>

        {/* Text */}
        <div className="mt-8 sm:mt-10 lg:mt-0">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-accent" />
            <span className="text-[12px] tracking-eyebrow uppercase text-accent font-semibold">About the Portal</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light leading-[1.05] tracking-display text-primary mb-1">
            Built for Nigerian
          </h2>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light leading-[1.05] tracking-display text-accent italic mb-4">
            legal practitioners.
          </h2>
          <div className="rule-gold w-16 sm:w-24 mb-6" />
          <div className="space-y-3 text-muted-foreground leading-relaxed text-base sm:text-lg">
            <p>
              The NBA Remuneration Portal supports legal practitioners across all NBA branches in Nigeria, providing a unified platform for document preparation, remuneration tracking, and committee administration.
            </p>
            <p>
              Access is exclusive to verified NBA members. Upon registration, accounts are reviewed and approved by administrators before full portal access is granted.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 sm:gap-8 mt-8">
            {[
              { icon: Shield, label: "Secure" },
              { icon: Scale, label: "Compliant" },
              { icon: Users, label: "Member-only" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-accent/40 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                </div>
                <span className="text-[12px] tracking-eyebrow uppercase font-semibold text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default About;
