import { Sidebar, TabBar, type SidebarUnit } from "@/components/AppNav";
import { getAllLessons } from "@/lib/content/load";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  const units = new Map<string, SidebarUnit>();
  for (const l of getAllLessons()) {
    const u = units.get(l.meta.unit.id) ?? { id: l.meta.unit.id, title: l.meta.unit.title, lessons: [] };
    u.lessons.push({ id: l.meta.id, title: l.meta.title });
    units.set(u.id, u);
  }
  return (
    <>
      <Sidebar units={[...units.values()]} />
      <div className="lg:pl-64">
        <main className="content pt-8">{children}</main>
        <div className="tabbar-spacer" aria-hidden="true" />
      </div>
      <TabBar />
    </>
  );
}
