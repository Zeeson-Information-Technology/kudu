import PinLoginClient from "../../../src/features/auth/PinLoginClient";

export const dynamic = "force-dynamic";

export default function PinLoginPage({
  searchParams
}: {
  searchParams?: { userId?: string };
}) {
  return <PinLoginClient userId={searchParams?.userId ?? null} />;
}
