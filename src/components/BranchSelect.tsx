import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const NBA_BRANCHES = [
  // Abia
  "Aba", "Umuahia",
  // Adamawa
  "Yola", "Mubi", "Ganye",
  // Akwa Ibom
  "Uyo", "Eket", "Ikot Ekpene", "Oron",
  // Anambra
  "Awka", "Onitsha", "Nnewi", "Aguata", "Anaocha", "Ogidi", "Otuocha",
  // Bauchi
  "Bauchi", "Azare", "Misau",
  // Bayelsa
  "Yenagoa", "Brass",
  // Benue
  "Makurdi", "Gboko", "Katsina-Ala", "Otukpo", "Vandeikya", "Zaki Biam",
  // Borno
  "Maiduguri", "Biu", "Gwoza",
  // Cross River
  "Calabar", "Ikom", "Ogoja", "Obudu",
  // Delta
  "Asaba", "Warri", "Sapele", "Ughelli", "Agbor", "Kwale", "Oleh",
  // Ebonyi
  "Abakaliki", "Afikpo", "Onueke",
  // Edo
  "Benin City", "Auchi", "Ekpoma", "Uromi", "Igarra",
  // Ekiti
  "Ado Ekiti", "Ikere Ekiti", "Ilawe Ekiti", "Ijero Ekiti",
  // Enugu
  "Enugu", "Nsukka", "Agbani", "Oji River", "Enugu Ezike",
  // FCT
  "Abuja", "Gwagwalada", "Kuje",
  // Gombe
  "Gombe", "Billiri", "Kaltungo",
  // Imo
  "Owerri", "Orlu", "Okigwe", "Oguta",
  // Jigawa
  "Dutse", "Hadejia", "Birnin Kudu", "Gumel",
  // Kaduna
  "Kaduna", "Kafanchan", "Zaria", "Kagoro",
  // Kano
  "Kano", "Wudil", "Rano",
  // Katsina
  "Katsina", "Daura", "Funtua", "Malumfashi",
  // Kebbi
  "Birnin Kebbi", "Argungu", "Yelwa",
  // Kogi
  "Lokoja", "Okene", "Idah", "Kabba", "Anyigba", "Ankpa",
  // Kwara
  "Ilorin", "Offa", "Lafiagi", "Patigi",
  // Lagos
  "Lagos", "Ikeja", "Badagry", "Ikorodu", "Epe",
  // Nasarawa
  "Lafia", "Keffi", "Karu", "Akwanga",
  // Niger
  "Minna", "Bida", "Kontagora", "Suleja", "Mokwa",
  // Ogun
  "Abeokuta", "Sagamu", "Ijebu Ode", "Ilaro", "Ota",
  // Ondo
  "Akure", "Ondo", "Owo", "Okitipupa", "Ikare",
  // Osun
  "Osogbo", "Ile Ife", "Ilesa", "Ede",
  // Oyo
  "Ibadan", "Ogbomoso", "Oyo", "Iseyin", "Saki",
  // Plateau
  "Jos", "Shendam", "Pankshin", "Langtang",
  // Rivers
  "Port Harcourt", "Okrika", "Degema", "Ahoada",
  // Sokoto
  "Sokoto", "Tambuwal", "Gwadabawa",
  // Taraba
  "Jalingo", "Wukari", "Takum",
  // Yobe
  "Damaturu", "Gashua", "Potiskum",
  // Zamfara
  "Gusau", "Kaura Namoda", "Talata Mafara",
].sort();

interface BranchSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const BranchSelect = ({ value, onChange, required, disabled, className }: BranchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? NBA_BRANCHES.filter((b) => b.toLowerCase().includes(query.toLowerCase()))
    : NBA_BRANCHES;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (branch: string) => {
    onChange(branch);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between border border-input bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60",
          disabled && "opacity-60 cursor-not-allowed bg-muted",
          !value && "text-muted-foreground"
        )}
      >
        <span>{value || "Select NBA Branch"}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-background border border-border rounded-sm shadow-elegant overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2.5 px-3 py-3 border-b border-border/60">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search branches..."
              className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none ring-0 border-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none"
              style={{ boxShadow: "none" }}
            />
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground text-center">No branch found.</p>
            ) : (
              filtered.map((branch) => (
                <button
                  key={branch}
                  type="button"
                  onClick={() => handleSelect(branch)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors",
                    value === branch && "bg-accent/10 text-accent font-medium"
                  )}
                >
                  {branch}
                  {value === branch && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSelect;
