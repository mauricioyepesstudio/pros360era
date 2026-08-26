import AccountShell from "@/components/account/AccountShell";
import { getCurrentRole } from "@/lib/account/persistence";
export default async function AccountLayout({children}:{children:React.ReactNode}){const role=await getCurrentRole();return <AccountShell role={role}>{children}</AccountShell>}
