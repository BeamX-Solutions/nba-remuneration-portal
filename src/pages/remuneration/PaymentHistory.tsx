import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PaymentHistory = () => (
  <PortalLayout>
    <div className="space-y-6">
      <PageHeader eyebrow="Transactions" title="Payment History" subtitle="Review your transaction records and remuneration details." />

      <Card className="shadow-card">
        <CardContent className="p-12 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <FileText className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="font-display text-2xl font-light text-foreground tracking-display mb-2">No payments recorded yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Your completed transactions, verified fees, and pending invoices will appear here once they are processed through the portal.
          </p>
          <Button asChild variant="default">
            <Link to="/dashboard/guidelines">View Remuneration Guidelines</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  </PortalLayout>
);

export default PaymentHistory;
