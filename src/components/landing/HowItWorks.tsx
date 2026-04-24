const steps = [
  {
    num: "01",
    title: "Register & Verify",
    desc: "Create your account using your NBA membership details. Admins verify and approve your account before access is granted.",
  },
  {
    num: "02",
    title: "Prepare Documents",
    desc: "Use the guided document preparation tool to generate legally accurate documents. Fill in details and preview before submitting.",
  },
  {
    num: "03",
    title: "Track & Download",
    desc: "Submit for approval and track the status in real time. Once approved, download your document as a formatted PDF.",
  },
];

const HowItWorks = () => (
  <section id="how" className="py-16 sm:py-24 lg:py-32 bg-parchment">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="text-center mb-12 sm:mb-16 lg:mb-24">
        <div className="flex items-center justify-center gap-3 mb-5 sm:mb-8">
          <span className="h-px w-10 sm:w-12 bg-accent" />
          <span className="text-[12px] tracking-eyebrow uppercase text-accent font-semibold">How It Works</span>
          <span className="h-px w-10 sm:w-12 bg-accent" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-display text-primary font-light leading-[1.05]">
          Three steps from
          <br />
          <em className="italic font-normal text-accent">draft to delivery.</em>
        </h2>
      </div>

      <div className="relative grid md:grid-cols-3 gap-8 sm:gap-10 max-w-4xl mx-auto">
        {/* Connector line (desktop only) */}
        <div className="absolute top-[2.25rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-accent/30 via-accent/50 to-accent/30 hidden md:block" />

        {steps.map((s) => (
          <div key={s.num} className="text-center relative">
            <div className="relative inline-flex h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-accent/30 items-center justify-center mb-5 sm:mb-7 bg-parchment shadow-sm mx-auto">
              <span className="font-display text-xl sm:text-2xl italic font-normal text-accent">{s.num}</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-primary mb-3 tracking-display">{s.title}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
