import nbaLogo from "@/assets/nba-logo.png";

const Footer = () => (
  <footer className="bg-foreground text-ivory/70 py-10 sm:py-14 border-t-4 border-accent/60">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <img src={nbaLogo} alt="NBA emblem" className="h-9 w-9 sm:h-11 sm:w-11 object-contain bg-ivory/5 rounded-full p-1" />
            <div>
              <p className="font-display text-base sm:text-lg text-ivory font-semibold">NBA Remuneration</p>
              <p className="text-[11px] tracking-eyebrow uppercase text-ivory/50">Legal Document Portal</p>
            </div>
          </div>
          <p className="text-sm text-ivory/60 leading-relaxed max-w-sm">
            The official document preparation and remuneration tracking platform of the Nigerian Bar Association.
          </p>
        </div>

        <div>
          <p className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold mb-3 sm:mb-4">Portal</p>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#features" className="hover:text-accent transition-elegant">Features</a></li>
            <li><a href="#about" className="hover:text-accent transition-elegant">About</a></li>
            <li><a href="#how" className="hover:text-accent transition-elegant">How it Works</a></li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold mb-3 sm:mb-4">Account</p>
          <ul className="space-y-2.5 text-sm">
            <li><a href="/signup" className="hover:text-accent transition-elegant">Register</a></li>
            <li><a href="/signin" className="hover:text-accent transition-elegant">Sign In</a></li>
            <li><a href="/dashboard/about" className="hover:text-accent transition-elegant">Support</a></li>
          </ul>
        </div>
      </div>

      <div className="rule-gold mb-6 sm:mb-8" />

      <div className="flex flex-wrap justify-between items-center gap-3 text-xs text-ivory/50">
        <p>© {new Date().getFullYear()} Nigerian Bar Association. All rights reserved.</p>
        <p className="tracking-eyebrow uppercase">Justitia · Veritas · Integritas</p>
      </div>
    </div>
  </footer>
);

export default Footer;
