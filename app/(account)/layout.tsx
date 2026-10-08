import AccountShell from "@/components/account/AccountShell";
import { getCurrentAccountIdentity } from "@/lib/account/persistence";
import AccountRecovery from "@/components/account/AccountRecovery";
import { redirect } from "next/navigation";
export default async function AccountLayout({children}:{children:React.ReactNode}) {
  const identity = await getCurrentAccountIdentity();
  if (identity.status === "signed_out") redirect("/login");
  if (identity.status === "role_unavailable") return <AccountRecovery email={identity.email} />;
  return <AccountShell role={identity.role} email={identity.email}>{children}</AccountShell>;
}
