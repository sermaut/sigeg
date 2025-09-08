import { MemberForm } from "@/components/forms/MemberForm";
import { MainLayout } from "@/components/layout/MainLayout";
import { useSearchParams } from "react-router-dom";

export default function NewMember() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <MemberForm groupId={groupId || undefined} />
      </div>
    </MainLayout>
  );
}