import { Sidebar, TabBar } from "@/components/AppNav";
import { getUnits } from "@/lib/content/curriculum";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  const units = getUnits().map((u) => ({ id: u.id, order: u.order, title: u.title }));
  return (
    <>
      <Sidebar units={units} />
      <div className="lg:pl-64">
        <main className="content pt-6">{children}</main>
        <div className="tabbar-spacer" aria-hidden="true" />
      </div>
      <TabBar />
    </>
  );
}
