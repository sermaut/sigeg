import { GroupForm } from "@/components/forms/GroupForm";
import { MainLayout } from "@/components/layout/MainLayout";

export default function NewGroup() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <GroupForm />
      </div>
    </MainLayout>
  );
}