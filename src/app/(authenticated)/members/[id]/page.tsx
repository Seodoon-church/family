import { MemberDetailClient } from "./member-detail-client";

export async function generateStaticParams() {
  return [{ id: "_" }];
}

export default function MemberDetailPage() {
  return <MemberDetailClient />;
}
