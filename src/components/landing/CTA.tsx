import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTA = () => (
  <section className="py-16 sm:py-24 lg:py-32 bg-emerald relative overflow-hidden">
    {/* Dot pattern overlay */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, hsl(var(--accent)) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    />
    {/* NBA watermark */}
    <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block opacity-10 select-none pointer-events-none">
      <p className="font-display text-[14rem] font-bold text-accent leading-none tracking-display">NBA</p>
    </div>

    <div className="container mx-auto relative grid lg:grid-cols-2 gap-8 sm:gap-10 items-center px-4 sm:px-6">
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="h-px w-10 sm:w-12 bg-accent" />
          <span className="text-[12px] tracking-eyebrow uppercase text-accent font-semibold">Ready to get started?</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory font-light leading-[1.05] tracking-display mb-5">
          Join the future of
          <br />
          <em className="italic font-normal text-gradient-gold">legal documentation.</em>
        </h2>
        <p className="text-ivory/75 text-base sm:text-lg leading-relaxed max-w-xl">
          Register your NBA member account today and gain instant access to professional document preparation, approval workflows, and remuneration tracking.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 lg:justify-end">
        <Button variant="gold" size="lg" asChild className="h-10 sm:h-12 text-sm sm:text-base px-5 sm:px-7">
          <Link to="/signup">
            Create Account <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outlineLight" size="lg" asChild className="h-10 sm:h-12 text-sm sm:text-base px-5 sm:px-7">
          <Link to="/signin">Sign In</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default CTA;
