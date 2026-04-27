import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2, BookOpen, FolderOpen, Download, CheckCircle2, Info } from "lucide-react";
import { exportDocumentToPDF } from "@/lib/pdfExport";
import { saveDocumentVersion } from "@/lib/documentUtils";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_TITLE, calcDocFee } from "@/lib/constants";

const STEPS = [
  { num: 1, label: "Prepare" },
  { num: 2, label: "Preview" },
  { num: 3, label: "Payment" },
  { num: 4, label: "Final Document" },
];

type DocType = "deed_of_assignment" | "deed_of_gift" | "mortgage_deed" | "power_of_attorney" | "contract_of_sale" | "tenancy_agreement" | "deed_of_lease" | "deed_of_sub_lease" | "deed_of_surrender" | "deed_of_release" | "deed_of_exchange";

interface FieldDef { key: string; label: string; required?: boolean; fullWidth?: boolean; type?: "select"; options?: string[]; }

const ROOT_OF_TITLE_OPTIONS = [
  "Deed of Assignment",
  "Certificate of Occupancy (C of O)",
  "Statutory Right of Occupancy (S.R.O.)",
  "Deed of Gift",
  "Mortgage Deed (Discharged)",
  "Court Order / Judgment",
  "Excision / Gazette Notice",
  "Letter of Administration",
  "Grant of Probate",
  "Power of Attorney (Prior Transaction)",
];

const DOC_TYPES: { value: DocType; label: string; partyLabels: [string, string]; fields: FieldDef[] }[] = [
  {
    value: "deed_of_assignment", label: "Deed of Assignment", partyLabels: ["ASSIGNOR / VENDOR", "ASSIGNEE / PURCHASER"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "land_address", label: "Land Address", required: true, fullWidth: true },
      { key: "consideration", label: "Consideration Value (₦)", required: true },
      { key: "survey_plan_no", label: "Survey Plan No (Optional)" },
      { key: "beacon_nos", label: "Beacon Nos. (Optional)" },
      { key: "root_of_title", label: "Root of Title (How Assignor Acquired)", required: true, fullWidth: true, type: "select", options: ROOT_OF_TITLE_OPTIONS },
      { key: "root_of_title_date", label: "Date of Root Title Instrument", required: true },
      { key: "root_of_title_ref", label: "Root Title Reference / Number", required: true },
      { key: "title_doc_ref", label: "Title Document Reference (Optional)" },
    ],
  },
  {
    value: "deed_of_gift", label: "Deed of Gift", partyLabels: ["DONOR", "DONEE"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "land_address", label: "Full Address of Property", required: true, fullWidth: true },
      { key: "survey_plan_no", label: "Survey Plan No (Optional)" },
      { key: "beacon_nos", label: "Beacon Nos. (Optional)" },
      { key: "root_of_title", label: "Root of Title (How Donor Acquired)", required: true, fullWidth: true, type: "select", options: ROOT_OF_TITLE_OPTIONS },
      { key: "root_of_title_date", label: "Date of Root Title Instrument", required: true },
      { key: "root_of_title_ref", label: "Root Title Reference / Number", required: true },
      { key: "title_doc_ref", label: "Title Document Reference (Optional)" },
    ],
  },
  {
    value: "mortgage_deed", label: "Mortgage Deed", partyLabels: ["MORTGAGOR", "MORTGAGEE (LENDER)"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "land_address", label: "Full Address of Mortgaged Property", required: true, fullWidth: true },
      { key: "consideration", label: "Loan Amount (₦)", required: true },
      { key: "interest_rate", label: "Interest Rate (%)", required: true },
      { key: "repayment_period", label: "Repayment Period", required: true },
      { key: "survey_plan_no", label: "Survey Plan No (Optional)" },
      { key: "root_of_title", label: "Root of Title (How Mortgagor Acquired)", required: true, fullWidth: true, type: "select", options: ROOT_OF_TITLE_OPTIONS },
      { key: "root_of_title_date", label: "Date of Root Title Instrument", required: true },
      { key: "root_of_title_ref", label: "Root Title Reference / Number", required: true },
      { key: "title_doc_ref", label: "Title Document Reference (Optional)" },
    ],
  },
  {
    value: "power_of_attorney", label: "Power of Attorney", partyLabels: ["DONOR / PRINCIPAL", "ATTORNEY"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "scope_of_authority", label: "Scope of Authority", required: true, fullWidth: true },
      { key: "land_address", label: "Address of Property (if applicable)" },
      { key: "duration", label: "Duration / Expiry (leave blank if unless-revoked)" },
    ],
  },
  {
    value: "contract_of_sale", label: "Contract of Sale", partyLabels: ["VENDOR", "PURCHASER"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "land_address", label: "Full Address of Property", required: true, fullWidth: true },
      { key: "consideration", label: "Purchase Price (₦)", required: true },
      { key: "deposit_amount", label: "Deposit Amount (₦)" },
      { key: "completion_date", label: "Completion Date", required: true },
      { key: "investigation_period", label: "Investigation of Title Period (e.g. 21 days)", required: true },
      { key: "survey_plan_no", label: "Survey Plan No (Optional)" },
      { key: "title_doc_ref", label: "Title Document Reference (Optional)" },
    ],
  },
  {
    value: "tenancy_agreement", label: "Tenancy Agreement", partyLabels: ["LANDLORD", "TENANT"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "land_address", label: "Full Address of Premises", required: true, fullWidth: true },
      { key: "consideration", label: "Annual Rent (₦)", required: true },
      { key: "tenancy_duration", label: "Duration of Tenancy", required: true },
      { key: "commencement_date", label: "Commencement Date", required: true },
      { key: "notice_period", label: "Notice Period for Termination", required: true },
      { key: "service_address", label: "Address for Service of Notices", fullWidth: true },
    ],
  },
  {
    value: "deed_of_lease", label: "Deed of Lease", partyLabels: ["LESSOR / LANDLORD", "LESSEE / TENANT"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "land_address", label: "Full Address of Property", required: true, fullWidth: true },
      { key: "consideration", label: "Annual Rent (₦)", required: true },
      { key: "lease_term", label: "Lease Term (e.g. 21 years)", required: true },
      { key: "commencement_date", label: "Commencement Date", required: true },
      { key: "survey_plan_no", label: "Survey Plan No. (Optional)" },
      { key: "root_of_title", label: "Root of Title (How Lessor Acquired)", required: true, fullWidth: true, type: "select", options: ROOT_OF_TITLE_OPTIONS },
      { key: "root_of_title_date", label: "Date of Root Title Instrument", required: true },
      { key: "title_doc_ref", label: "Title Document Reference (Optional)" },
      { key: "service_address", label: "Address for Service of Notices", fullWidth: true },
    ],
  },
  {
    value: "deed_of_sub_lease", label: "Deed of Sub-Lease", partyLabels: ["SUB-LESSOR", "SUB-LESSEE"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "land_address", label: "Full Address of Property", required: true, fullWidth: true },
      { key: "consideration", label: "Annual Rent (₦)", required: true },
      { key: "sub_lease_term", label: "Sub-Lease Term (e.g. 3 years)", required: true },
      { key: "commencement_date", label: "Commencement Date", required: true },
      { key: "head_lease_ref", label: "Head Lease Reference", required: true },
      { key: "survey_plan_no", label: "Survey Plan No. (Optional)" },
      { key: "service_address", label: "Address for Service of Notices", fullWidth: true },
    ],
  },
  {
    value: "deed_of_surrender", label: "Deed of Surrender", partyLabels: ["SURRENDEROR (LEASEHOLDER)", "SURRENDEREE (LANDLORD / GRANTOR)"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "land_address", label: "Full Address of Property", required: true, fullWidth: true },
      { key: "original_lease_ref", label: "Original Lease Reference", required: true },
      { key: "original_lease_term", label: "Original Lease Term", required: true },
      { key: "surrender_date", label: "Surrender Effective Date", required: true },
      { key: "consideration", label: "Surrender Premium (₦) — enter 0 if none" },
      { key: "survey_plan_no", label: "Survey Plan No. (Optional)" },
    ],
  },
  {
    value: "deed_of_release", label: "Deed of Release / Discharge of Mortgage", partyLabels: ["MORTGAGEE / LENDER", "MORTGAGOR / BORROWER"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "land_address", label: "Full Address of Property", required: true, fullWidth: true },
      { key: "original_mortgage_ref", label: "Original Mortgage Deed Reference", required: true },
      { key: "original_mortgage_date", label: "Date of Original Mortgage", required: true },
      { key: "consideration", label: "Original Loan Amount (₦)", required: true },
      { key: "discharge_date", label: "Date of Full Repayment / Discharge", required: true },
      { key: "survey_plan_no", label: "Survey Plan No. (Optional)" },
    ],
  },
  {
    value: "deed_of_exchange", label: "Deed of Exchange", partyLabels: ["FIRST PARTY", "SECOND PARTY"],
    fields: [
      { key: "donor_name", label: "Name", required: true },
      { key: "donor_address", label: "Address", required: true },
      { key: "donee_name", label: "Name", required: true },
      { key: "donee_address", label: "Address", required: true },
      { key: "first_property_address", label: "First Property Address (given by First Party)", required: true, fullWidth: true },
      { key: "second_property_address", label: "Second Property Address (given by Second Party)", required: true, fullWidth: true },
      { key: "first_property_value", label: "First Property Value (₦)", required: true },
      { key: "second_property_value", label: "Second Property Value (₦)", required: true },
      { key: "consideration", label: "Balancing Payment (₦) — enter 0 if equal value" },
      { key: "first_survey_plan", label: "Survey Plan No. (First Property)" },
      { key: "second_survey_plan", label: "Survey Plan No. (Second Property)" },
      { key: "root_of_title", label: "Root of Title (First Property)", required: true, fullWidth: true, type: "select", options: ROOT_OF_TITLE_OPTIONS },
    ],
  },
];

const PrepareDocument = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [docType, setDocType] = useState<DocType>("deed_of_assignment");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [savedFormData, setSavedFormData] = useState<Partial<Record<DocType, Record<string, string>>>>({});
  const [precedentText, setPrecedentText] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<"ai" | "precedent">("ai");
  const [userBan, setUserBan] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("ban").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.ban) setUserBan(data.ban); });
  }, [user]);

  const selectedDoc = DOC_TYPES.find((d) => d.value === docType)!;
  const donorFields = selectedDoc.fields.filter((f) => f.key.startsWith("donor_"));
  const doneeFields = selectedDoc.fields.filter((f) => f.key.startsWith("donee_"));
  const propertyFields = selectedDoc.fields.filter((f) => !f.key.startsWith("donor_") && !f.key.startsWith("donee_"));

  const handleGenerateAI = async () => {
    const allRequired = selectedDoc.fields.filter((f) => f.required);
    for (const field of allRequired) {
      if (!formData[field.key]?.trim()) {
        toast({ title: "Required field missing", description: `${field.label} is required.`, variant: "destructive" });
        return;
      }
    }
    setGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-document", {
        body: { formData, method: "ai", documentType: docType },
      });
      if (response.error) throw new Error(response.error.message);
      const aiContent = response.data?.content;
      if (!aiContent) throw new Error("Empty response from AI");
      setGeneratedContent(aiContent);
    } catch (err: any) {
      toast({
        title: "AI generation unavailable",
        description: "Falling back to standard template. Check that the ANTHROPIC_API_KEY is set in your Supabase project secrets.",
        variant: "destructive",
      });
      setGeneratedContent(generateFallbackDocument(docType, formData));
    }
    setGenerating(false);
    setCurrentStep(2);
  };

  const handleProcessPrecedent = async () => {
    if (!precedentText.trim()) {
      toast({ title: "Required", description: "Please paste your precedent document.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-document", {
        body: { precedentText, method: "precedent" },
      });
      if (response.error) throw new Error(response.error.message);
      const aiContent = response.data?.content;
      if (!aiContent) throw new Error("Empty response from AI");
      setGeneratedContent(aiContent);
    } catch {
      toast({
        title: "AI reformatting unavailable",
        description: "Using your precedent as-is. Check that the ANTHROPIC_API_KEY is set in your Supabase project secrets.",
        variant: "destructive",
      });
      setGeneratedContent(precedentText);
    }
    setGenerating(false);
    setCurrentStep(2);
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    const allRequired = selectedDoc.fields.filter((f) => f.required);
    for (const field of allRequired) {
      if (!formData[field.key]?.trim()) {
        toast({ title: "Required field missing", description: `${field.label} is required.`, variant: "destructive" });
        return;
      }
    }
    setSaving(true);
    const content = generateFallbackDocument(docType, formData);
    const refNum = `REM-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase.from("documents").insert({
      user_id: user.id,
      title: `${selectedDoc.label} - ${formData.donee_name || formData.donor_name || "Draft"}`,
      document_type: docType,
      content,
      form_data: formData as any,
      status: "draft",
      reference_number: refNum,
      ban: userBan,
      approval_status: "pending",
    }).select();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }
    const docId = data?.[0]?.id;
    if (!docId) {
      toast({ title: "Error", description: "Document could not be saved. Please try again.", variant: "destructive" });
      setSaving(false);
      return;
    }
    await saveDocumentVersion(docId, user.id, content, formData as any);
    toast({ title: "Draft saved!", description: `Reference: ${refNum}` });
    setSaving(false);
    setCurrentStep(4);
  };

  const handleExportDocument = () => {
    const title = method === "ai" ? selectedDoc?.label : "Precedent Document";
    exportDocumentToPDF(`doc-${Date.now()}`, title, generatedContent, { ban: userBan ?? undefined, status: "Draft" });
    toast({ title: "Exporting PDF..." });
  };

  const handleSaveDocument = async () => {
    if (!user) return;
    setSaving(true);
    const refNum = `REM-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase.from("documents").insert({
      user_id: user.id,
      title: method === "ai"
        ? `${selectedDoc.label} - ${formData.donee_name || formData.donor_name || "Draft"}`
        : "Precedent Document",
      document_type: method === "ai" ? docType : "precedent",
      content: generatedContent,
      form_data: method === "ai" ? (formData as any) : ({ precedent: precedentText } as any),
      status: "draft",
      reference_number: refNum,
      ban: userBan,
      approval_status: "pending",
    }).select();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    const docId = data?.[0]?.id;
    if (!docId) { toast({ title: "Error", description: "Document could not be saved. Please try again.", variant: "destructive" }); setSaving(false); return; }
    await saveDocumentVersion(docId, user.id, generatedContent, method === "ai" ? (formData as any) : ({ precedent: precedentText } as any));
    toast({ title: "Document saved!", description: `Reference: ${refNum}` });
    setSaving(false);
    setCurrentStep(4);
  };

  const handleFieldChange = (key: string, label: string, value: string) => {
    if (label.includes("(₦)")) {
      const digits = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [key]: digits ? parseInt(digits, 10).toLocaleString("en-NG") : "" }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const resetForm = () => {
    setCurrentStep(1); setGeneratedContent(""); setFormData({}); setSavedFormData({}); setPrecedentText(""); setDocType("deed_of_assignment");
  };

  const renderField = (field: FieldDef) => (
    <div key={field.key} className={field.fullWidth ? "col-span-full" : ""}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {field.type === "select" && field.options ? (
        <Select
          value={formData[field.key] || ""}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, [field.key]: v }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.key === "scope_of_authority" ? (
        <textarea
          rows={3}
          value={formData[field.key] || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
          placeholder={field.label}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      ) : (
        <input
          type="text"
          inputMode={field.label.includes("(₦)") ? "numeric" : "text"}
          value={formData[field.key] || ""}
          onChange={(e) => handleFieldChange(field.key, field.label, e.target.value)}
          placeholder={field.label.includes("(₦)") ? "₦ 0.00" : field.label}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );

  return (
    <PortalLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="New Filing" title="Prepare a Document" subtitle="Complete the necessary details to generate your legal document." />

        {/* Step indicator */}
        <Card className="shadow-card">
          <CardContent className="px-6 py-4">
            <div className="flex items-center">
              {STEPS.map((step, i) => (
                <div key={step.num} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                        currentStep === step.num
                          ? "bg-foreground text-background border-foreground"
                          : currentStep > step.num
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-muted-foreground/30"
                      )}
                    >
                      {step.num}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium hidden sm:block",
                        currentStep >= step.num ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("flex-1 h-px mx-2 sm:mb-5", currentStep > step.num ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Form */}
        {currentStep === 1 && (
          <Tabs defaultValue="ai" onValueChange={(v) => setMethod(v as "ai" | "precedent")}>
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="ai" className="flex items-center gap-2 text-xs">
                <Sparkles className="h-3.5 w-3.5" /> AI Generated
              </TabsTrigger>
              <TabsTrigger value="precedent" className="flex items-center gap-2 text-xs">
                <BookOpen className="h-3.5 w-3.5" /> Use Precedent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                {/* Document Details form — always first on mobile */}
                <div className="lg:col-span-2">
                  <Card className="shadow-card">
                    <CardContent className="p-4 sm:p-6 space-y-5">
                      <h3 className="font-heading text-lg font-bold text-foreground">Document Details</h3>

                      {/* Document type */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Document Type
                        </label>
                        <Select
                          value={docType}
                          onValueChange={(v) => {
                            const newType = v as DocType;
                            setSavedFormData(prev => ({ ...prev, [docType]: formData }));
                            setFormData(savedFormData[newType] ?? {});
                            setDocType(newType);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DOC_TYPES.map((d) => (
                              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Party fields in two bordered columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border border-border rounded-lg p-4 space-y-3">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {selectedDoc.partyLabels[0]}
                          </p>
                          {donorFields.map(renderField)}
                        </div>
                        <div className="border border-border rounded-lg p-4 space-y-3">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {selectedDoc.partyLabels[1]}
                          </p>
                          {doneeFields.map(renderField)}
                        </div>
                      </div>

                      {/* Property & Consideration */}
                      {propertyFields.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                            Property &amp; Consideration
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {propertyFields.map(renderField)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Summary + Need Assistance — below form on mobile, right column on desktop */}
                <div className="space-y-4">
                  <div className="bg-muted/60 rounded-xl p-5 space-y-4">
                    <h4 className="font-heading text-base font-bold text-foreground">Summary</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ensure all details are accurate before proceeding to the preview step. Legal documents require exact precision.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        Standard Clauses Included
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        Jurisdiction: Nigeria
                      </div>
                    </div>
                    <div className="space-y-2 pt-1">
                      <Button
                        onClick={handleGenerateAI}
                        disabled={generating}
                        className="w-full gap-2"
                      >
                        {generating
                          ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                          : "Continue to Preview →"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="w-full"
                      >
                        {saving ? "Saving..." : "Save Draft"}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">Need Assistance?</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          Review the documentation guidelines for {selectedDoc.label} or contact support for complex structures.
                        </p>
                        <a href="/dashboard/about" className="text-xs font-semibold text-primary underline mt-1 inline-block">
                          View Guidelines
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="precedent">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-2">
                  <Card className="shadow-card">
                    <CardContent className="p-4 sm:p-6 space-y-4">
                      <h3 className="font-heading text-lg font-bold text-foreground">Use Your Precedent</h3>
                      <p className="text-sm text-muted-foreground">
                        Paste your existing document. The system will reformat it for remuneration compliance.
                      </p>
                      <textarea
                        rows={12}
                        value={precedentText}
                        onChange={(e) => setPrecedentText(e.target.value)}
                        placeholder="Paste your precedent document here..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4">
                  <div className="bg-muted/60 rounded-xl p-5 space-y-4">
                    <h4 className="font-heading text-base font-bold text-foreground">Summary</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your document will be reviewed and formatted to meet remuneration compliance requirements.
                    </p>
                    <Button onClick={handleProcessPrecedent} disabled={generating} className="w-full gap-2">
                      {generating
                        ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
                        : "Continue to Preview →"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Step 2: Preview */}
        {currentStep === 2 && (
          <Card className="shadow-card">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-heading text-xl font-semibold">Document Preview</h3>
              <div className="border border-border rounded-md p-4 sm:p-6 bg-background min-h-[300px] prose prose-sm max-w-none text-foreground overflow-x-auto">
                <ReactMarkdown>{generatedContent}</ReactMarkdown>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>← Edit</Button>
                <Button variant="secondary" onClick={handleExportDocument}>
                  <Download className="h-4 w-4 mr-2" />Export as PDF
                </Button>
                <Button onClick={() => setCurrentStep(3)}>Proceed to Payment →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (() => {
          const fee = calcDocFee(formData, docType);
          const isPOA = docType === "power_of_attorney";
          return (
            <Card className="shadow-card">
              <CardContent className="p-4 sm:p-8 space-y-6 text-center">
                <h3 className="font-heading text-xl font-semibold">Payment</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  In line with the <strong>{ORDER_TITLE}</strong>, the remuneration fee due is shown below.
                </p>
                {isPOA ? (
                  <div className="inline-block bg-accent/10 border border-accent/30 rounded-xl px-5 py-5 sm:px-8 w-full sm:w-auto">
                    <p className="text-sm text-muted-foreground">Fee Assessment</p>
                    <p className="font-heading text-lg font-semibold text-primary mt-1">Flat fee — contact your branch</p>
                    <p className="text-xs text-muted-foreground mt-1.5">Power of Attorney fees are assessed under paragraph 2 of the Order and agreed with your branch.</p>
                  </div>
                ) : fee !== null && fee > 0 ? (
                  <div className="inline-block bg-accent/10 border border-accent/30 rounded-xl px-5 py-5 sm:px-8 w-full sm:w-auto">
                    <p className="text-sm text-muted-foreground">Drafting LP Fee (full scale)</p>
                    <p className="font-heading text-3xl font-bold text-primary mt-1">
                      ₦{fee.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Calculated under Scale 4 · {ORDER_TITLE}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Other party's LP is entitled to half: ₦{(fee / 2).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Payment gateway coming soon. Save as draft and complete payment at the secretariat.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>← Back</Button>
                  <Button onClick={handleSaveDocument} disabled={saving}>
                    {saving ? "Saving..." : "Save Document as Draft"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <Card className="shadow-card">
            <CardContent className="p-4 sm:p-8 space-y-4 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold">Document Saved Successfully</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your document has been saved as a draft. Submit it for approval and complete payment at the NBA secretariat to finalise.
              </p>
              <div className="flex gap-3 justify-center flex-wrap pt-2">
                <Button variant="outline" onClick={resetForm}>Create Another</Button>
                <Button asChild>
                  <a href="/dashboard/documents">
                    <FolderOpen className="h-4 w-4 mr-2" />View My Documents
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

function generateFallbackDocument(type: DocType, data: Record<string, string>): string {
  const today = "_____ day of ____________ 20__";

  switch (type) {
    case "deed_of_assignment":
      return `DEED OF ASSIGNMENT

THIS DEED OF ASSIGNMENT is made this ${today}

BETWEEN

${data.donor_name || "[ASSIGNOR/VENDOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Assignor")

OF THE ONE PART

AND

${data.donee_name || "[ASSIGNEE/PURCHASER NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Assignee")

OF THE OTHER PART

WHEREAS the Assignor is the beneficial owner of ALL THAT piece or parcel of land situate at ${data.land_address || "[LAND ADDRESS]"}${data.survey_plan_no ? ` covered by Survey Plan No. ${data.survey_plan_no}` : ""}${data.beacon_nos ? `, delineated by Beacon Nos. ${data.beacon_nos}` : ""}.

NOW THIS DEED WITNESSETH that in consideration of the sum of ₦${data.consideration || "[CONSIDERATION]"} paid by the Assignee to the Assignor (receipt acknowledged), the Assignor hereby assigns unto the Assignee the said property TO HOLD in fee simple.

IN WITNESS WHEREOF the parties have executed this Deed the day and year first above written.

SIGNED by the Assignor: _________________________
${data.donor_name || "[ASSIGNOR]"}

SIGNED by the Assignee: _________________________
${data.donee_name || "[ASSIGNEE]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "deed_of_gift":
      return `DEED OF GIFT

THIS DEED OF GIFT is made this ${today}

BETWEEN

${data.donor_name || "[DONOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Donor")

OF THE ONE PART

AND

${data.donee_name || "[DONEE NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Donee")

OF THE OTHER PART

WHEREAS the Donor is the lawful owner of ALL THAT piece or parcel of land situate at ${data.land_address || "[PROPERTY ADDRESS]"}${data.survey_plan_no ? `, Survey Plan No. ${data.survey_plan_no}` : ""}${data.beacon_nos ? `, Beacon Nos. ${data.beacon_nos}` : ""}.

NOW THIS DEED WITNESSETH that the Donor, out of natural love and affection for the Donee, hereby gives, transfers and conveys the said property to the Donee TO HOLD in fee simple, free from all encumbrances.

IN WITNESS WHEREOF the Donor has executed this Deed.

SIGNED by the Donor: _________________________
${data.donor_name || "[DONOR]"}

SIGNED by the Donee: _________________________
${data.donee_name || "[DONEE]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "mortgage_deed":
      return `MORTGAGE DEED

THIS MORTGAGE DEED is made this ${today}

BETWEEN

${data.donor_name || "[MORTGAGOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Mortgagor")

AND

${data.donee_name || "[MORTGAGEE NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Mortgagee")

WHEREAS the Mortgagor is the owner of ALL THAT property situate at ${data.land_address || "[PROPERTY ADDRESS]"}${data.survey_plan_no ? `, Survey Plan No. ${data.survey_plan_no}` : ""}.

NOW THIS DEED WITNESSETH that in consideration of the loan of ₦${data.consideration || "[LOAN AMOUNT]"} granted by the Mortgagee to the Mortgagor at an interest rate of ${data.interest_rate || "[INTEREST RATE]"}% per annum, repayable within ${data.repayment_period || "[REPAYMENT PERIOD]"}, the Mortgagor hereby charges and mortgages the said property to the Mortgagee as security for the loan and interest thereon.

IN WITNESS WHEREOF the parties have executed this Deed.

SIGNED by the Mortgagor: _________________________
${data.donor_name || "[MORTGAGOR]"}

SIGNED by the Mortgagee: _________________________
${data.donee_name || "[MORTGAGEE]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "power_of_attorney":
      return `POWER OF ATTORNEY

THIS POWER OF ATTORNEY is made this ${today}

BY

${data.donor_name || "[DONOR/PRINCIPAL NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Donor/Principal")

IN FAVOUR OF

${data.donee_name || "[ATTORNEY NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Attorney")

I, ${data.donor_name || "[DONOR/PRINCIPAL NAME]"}, hereby appoint ${data.donee_name || "[ATTORNEY]"} as my lawful Attorney to do the following on my behalf:

${data.scope_of_authority || "[SCOPE OF AUTHORITY]"}

${data.land_address ? `This Power of Attorney relates to the property situate at ${data.land_address}.` : ""}
${data.duration ? `This Power of Attorney shall remain valid until ${data.duration}.` : "This Power of Attorney shall remain valid unless revoked."}

IN WITNESS WHEREOF I have executed this Power of Attorney.

SIGNED by the Donor: _________________________
${data.donor_name || "[DONOR/PRINCIPAL]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "contract_of_sale":
      return `CONTRACT OF SALE OF LAND

THIS CONTRACT is made this ${today}

BETWEEN

${data.donor_name || "[VENDOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Vendor")

AND

${data.donee_name || "[PURCHASER NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Purchaser")

WHEREAS the Vendor is the beneficial owner of ALL THAT piece or parcel of land situate at ${data.land_address || "[PROPERTY ADDRESS]"}${data.survey_plan_no ? `, Survey Plan No. ${data.survey_plan_no}` : ""}.

IT IS HEREBY AGREED as follows:

1. The Vendor agrees to sell and the Purchaser agrees to buy the said property for the sum of ₦${data.consideration || "[PURCHASE PRICE]"}.
${data.deposit_amount ? `2. A deposit of ₦${data.deposit_amount} is payable upon execution of this Contract.` : ""}
${data.completion_date ? `3. Completion shall take place on or before ${data.completion_date}.` : "3. Completion shall take place within 90 days of execution of this Contract."}
4. The Vendor shall deliver a valid title to the property at completion.

IN WITNESS WHEREOF the parties have executed this Contract.

SIGNED by the Vendor: _________________________
${data.donor_name || "[VENDOR]"}

SIGNED by the Purchaser: _________________________
${data.donee_name || "[PURCHASER]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "tenancy_agreement":
      return `TENANCY AGREEMENT

THIS TENANCY AGREEMENT is made this ${today}

BETWEEN

${data.donor_name || "[LANDLORD NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Landlord")

AND

${data.donee_name || "[TENANT NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Tenant")

1. The Landlord hereby lets to the Tenant the premises situate at ${data.land_address || "[PREMISES ADDRESS]"}.

2. The tenancy shall be for a period of ${data.tenancy_duration || "[DURATION]"} commencing on ${data.commencement_date || "[COMMENCEMENT DATE]"}.

3. The annual rent is ₦${data.consideration || "[ANNUAL RENT]"}, payable in advance.

4. The Tenant shall:
   (a) Pay rent punctually as agreed;
   (b) Keep the premises in good condition;
   (c) Not sublet without the Landlord's written consent;
   (d) Vacate the premises at the end of the tenancy.

5. The Landlord shall:
   (a) Allow the Tenant quiet enjoyment of the premises;
   (b) Carry out structural repairs as required.

IN WITNESS WHEREOF the parties have executed this Agreement.

SIGNED by the Landlord: _________________________
${data.donor_name || "[LANDLORD]"}

SIGNED by the Tenant: _________________________
${data.donee_name || "[TENANT]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "deed_of_lease":
      return `DEED OF LEASE

THIS DEED OF LEASE is made this ${today}

BETWEEN

${data.donor_name || "[LESSOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Lessor")

OF THE ONE PART

AND

${data.donee_name || "[LESSEE NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Lessee")

OF THE OTHER PART

WHEREAS the Lessor is the beneficial owner of ALL THAT piece or parcel of land situate at ${data.land_address || "[PROPERTY ADDRESS]"}${data.survey_plan_no ? `, Survey Plan No. ${data.survey_plan_no}` : ""}.

NOW THIS DEED WITNESSETH that in consideration of the annual rent of ₦${data.consideration || "[ANNUAL RENT]"} and the covenants herein contained, the Lessor hereby leases to the Lessee the said property for a term of ${data.lease_term || "[LEASE TERM]"} commencing on ${data.commencement_date || "[COMMENCEMENT DATE]"}.

THE LESSEE COVENANTS:
(a) To pay the reserved rent on the dates and in the manner stipulated;
(b) To keep the premises in good and substantial repair;
(c) Not to sublet or assign without the Lessor's written consent;
(d) To yield up the premises at the end of the term in good repair.

THE LESSOR COVENANTS:
(a) To allow the Lessee quiet enjoyment of the premises during the term;
(b) To carry out structural repairs within a reasonable time.

IN WITNESS WHEREOF the parties have executed this Deed.

SIGNED by the Lessor: _________________________
${data.donor_name || "[LESSOR]"}

SIGNED by the Lessee: _________________________
${data.donee_name || "[LESSEE]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "deed_of_sub_lease":
      return `DEED OF SUB-LEASE

THIS DEED OF SUB-LEASE is made this ${today}

BETWEEN

${data.donor_name || "[SUB-LESSOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Sub-Lessor")

OF THE ONE PART

AND

${data.donee_name || "[SUB-LESSEE NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Sub-Lessee")

OF THE OTHER PART

WHEREAS the Sub-Lessor holds the property situate at ${data.land_address || "[PROPERTY ADDRESS]"} under a Head Lease referenced as ${data.head_lease_ref || "[HEAD LEASE REFERENCE]"} and is entitled to sub-let the same.

NOW THIS DEED WITNESSETH that in consideration of the annual rent of ₦${data.consideration || "[ANNUAL RENT]"} and the covenants herein contained, the Sub-Lessor hereby sub-lets to the Sub-Lessee the said property for a term of ${data.sub_lease_term || "[SUB-LEASE TERM]"} commencing on ${data.commencement_date || "[COMMENCEMENT DATE]"}.

This Sub-Lease is subject to and has the benefit of all the covenants and conditions contained in the Head Lease insofar as they relate to the property sub-let.

IN WITNESS WHEREOF the parties have executed this Deed.

SIGNED by the Sub-Lessor: _________________________
${data.donor_name || "[SUB-LESSOR]"}

SIGNED by the Sub-Lessee: _________________________
${data.donee_name || "[SUB-LESSEE]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "deed_of_surrender":
      return `DEED OF SURRENDER

THIS DEED OF SURRENDER is made this ${today}

BETWEEN

${data.donor_name || "[SURRENDEROR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Surrenderor")

OF THE ONE PART

AND

${data.donee_name || "[SURRENDEREE NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Surrenderee")

OF THE OTHER PART

WHEREAS the Surrenderor holds the property situate at ${data.land_address || "[PROPERTY ADDRESS]"}${data.survey_plan_no ? `, Survey Plan No. ${data.survey_plan_no}` : ""} under a Lease dated ${data.original_lease_ref || "[ORIGINAL LEASE REFERENCE]"} for a term of ${data.original_lease_term || "[ORIGINAL LEASE TERM]"}.

AND WHEREAS the Surrenderor is desirous of surrendering the unexpired residue of the said Lease to the Surrenderee.

NOW THIS DEED WITNESSETH that in consideration of the sum of ₦${data.consideration || "0"} (if any) and the mutual agreements herein, the Surrenderor hereby surrenders and yields up to the Surrenderee all the Surrenderor's estate and interest in the said property with effect from ${data.surrender_date || "[SURRENDER DATE]"}.

The Surrenderee accepts this Surrender and the Lease shall merge and be extinguished in the Surrenderee's interest in the property.

IN WITNESS WHEREOF the parties have executed this Deed.

SIGNED by the Surrenderor: _________________________
${data.donor_name || "[SURRENDEROR]"}

SIGNED by the Surrenderee: _________________________
${data.donee_name || "[SURRENDEREE]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "deed_of_release":
      return `DEED OF RELEASE AND DISCHARGE OF MORTGAGE

THIS DEED OF RELEASE AND DISCHARGE OF MORTGAGE is made this ${today}

BETWEEN

${data.donor_name || "[MORTGAGEE / LENDER NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Mortgagee")

OF THE ONE PART

AND

${data.donee_name || "[MORTGAGOR / BORROWER NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Mortgagor")

OF THE OTHER PART

WHEREAS by a Mortgage Deed dated ${data.original_mortgage_date || "[ORIGINAL MORTGAGE DATE]"} and referenced as ${data.original_mortgage_ref || "[ORIGINAL MORTGAGE REFERENCE]"}, the Mortgagor charged and mortgaged ALL THAT property situate at ${data.land_address || "[PROPERTY ADDRESS]"}${data.survey_plan_no ? `, Survey Plan No. ${data.survey_plan_no}` : ""} to the Mortgagee as security for the sum of ₦${data.consideration || "[LOAN AMOUNT]"}.

AND WHEREAS the Mortgagor has fully repaid the said principal sum together with all interest and other charges due thereunder as at ${data.discharge_date || "[DISCHARGE DATE]"}.

NOW THIS DEED WITNESSETH that the Mortgagee hereby releases, discharges and reassigns to the Mortgagor all the Mortgagee's right, title, interest and benefit in and to the said property free from all encumbrances arising under the said Mortgage.

The said Mortgage is hereby fully discharged and satisfied.

IN WITNESS WHEREOF the Mortgagee has executed this Deed.

SIGNED by the Mortgagee: _________________________
${data.donor_name || "[MORTGAGEE]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    case "deed_of_exchange":
      return `DEED OF EXCHANGE

THIS DEED OF EXCHANGE is made this ${today}

BETWEEN

${data.donor_name || "[FIRST PARTY NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the First Party")

OF THE ONE PART

AND

${data.donee_name || "[SECOND PARTY NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Second Party")

OF THE OTHER PART

WHEREAS the First Party is the beneficial owner of ALL THAT piece or parcel of land situate at ${data.first_property_address || "[FIRST PROPERTY ADDRESS]"}${data.first_survey_plan ? `, Survey Plan No. ${data.first_survey_plan}` : ""} valued at ₦${data.first_property_value || "[FIRST PROPERTY VALUE]"}.

AND WHEREAS the Second Party is the beneficial owner of ALL THAT piece or parcel of land situate at ${data.second_property_address || "[SECOND PROPERTY ADDRESS]"}${data.second_survey_plan ? `, Survey Plan No. ${data.second_survey_plan}` : ""} valued at ₦${data.second_property_value || "[SECOND PROPERTY VALUE]"}.

AND WHEREAS the parties have agreed to exchange the said properties on the terms herein.

NOW THIS DEED WITNESSETH:

1. The First Party hereby assigns and transfers to the Second Party all the First Party's right, title, interest and benefit in and to the First Property.

2. The Second Party hereby assigns and transfers to the First Party all the Second Party's right, title, interest and benefit in and to the Second Property.

${data.consideration && data.consideration !== "0" ? `3. In addition to the exchange of properties, a balancing payment of ₦${data.consideration} shall be paid by the party whose property has the lower value to the other party.` : "3. The exchange is made on an equal-value basis and no balancing payment is due."}

4. Each party covenants for quiet enjoyment and further assurance in respect of the property transferred by them.

IN WITNESS WHEREOF the parties have executed this Deed.

SIGNED by the First Party: _________________________
${data.donor_name || "[FIRST PARTY]"}

SIGNED by the Second Party: _________________________
${data.donee_name || "[SECOND PARTY]"}

---
Generated in compliance with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023.`;

    default:
      return "Document template not available.";
  }
}

export default PrepareDocument;
