import { getAccessCodes } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreateAccessCodeForm } from "./CreateAccessCodeForm";
import { deactivateAccessCode } from "./actions";
import { cn } from "@/lib/cn";

export default async function AdminAccessCodesPage() {
  const codes = await getAccessCodes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper">Access Codes</h1>
        <p className="mt-1 text-sm text-stone">
          Used for invite onboarding and key-drop fulfillment.
        </p>
      </div>

      <CreateAccessCodeForm />

      {codes.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No access codes yet.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <div className="divide-y divide-line">
            {codes.map((code) => (
              <div
                key={code.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-mono text-sm text-paper">{code.code}</p>
                  <p className="text-xs text-stone">
                    {code.usesCount}/{code.maxUses} used
                    {code.expiresAt &&
                      ` · expires ${new Date(code.expiresAt).toLocaleDateString("en-US")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(code.isActive && "border-gold/40 text-gold")}
                  >
                    {code.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {code.isActive && (
                    <form action={deactivateAccessCode.bind(null, code.id)}>
                      <button
                        type="submit"
                        className="text-xs text-stone transition-colors hover:text-danger"
                      >
                        Deactivate
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
