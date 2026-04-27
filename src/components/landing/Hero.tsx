import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import courthouseImg from "@/assets/hero-courthouse.jpg";

const Hero = () => (
  <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-14 sm:pt-20">
    <div className="absolute inset-0">
      <img
        src={courthouseImg}
        alt="Nigerian courthouse at golden hour"
        className="h-full w-full object-cover"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 bg-hero-overlay" />
    </div>

    <div className="container mx-auto relative z-10 grid lg:grid-cols-12 gap-8 items-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
      <div className="lg:col-span-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-5 sm:mb-7">
          <span className="h-px w-8 sm:w-12 bg-accent" />
          <span className="text-[11px] sm:text-[13px] tracking-eyebrow uppercase text-accent font-medium">
            Nigerian Bar Association
          </span>
        </div>

        <h1 className="font-display text-[clamp(2.4rem,8vw,6.5rem)] leading-[0.95] tracking-display text-ivory font-light mb-5 sm:mb-8">
          Where law
          <br />
          meets{" "}
          <em className="text-gradient-gold not-italic font-normal italic">precision.</em>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-ivory/80 max-w-2xl mb-8 sm:mb-10 leading-relaxed">
          A dedicated platform for NBA members to prepare, manage, and track legal documents with streamlined administrative oversight and full committee approval workflows.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="hero" size="lg" asChild className="h-10 sm:h-12 text-sm sm:text-base px-5 sm:px-7">
            <Link to="/signup">
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghostLight" size="lg" asChild className="h-10 sm:h-12 text-sm sm:text-base px-5 sm:px-7">
            <Link to="/signin">Member Sign In</Link>
          </Button>
        </div>

        <div className="mt-10 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl border-t border-ivory/15 pt-6 sm:pt-8">
          {[
            { k: "129", v: "NBA Branches" },
            { k: "11", v: "Document Types" },
            { k: "2023", v: "Remuneration Order" },
          ].map((s) => (
            <div key={s.v}>
              <p className="font-display text-2xl sm:text-4xl md:text-5xl text-ivory font-light">{s.k}</p>
              <p className="text-[10px] sm:text-sm tracking-eyebrow uppercase text-ivory/60 mt-1 sm:mt-2">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
