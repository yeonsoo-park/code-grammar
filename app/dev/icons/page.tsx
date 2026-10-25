import { notFound } from "next/navigation";
import { IconsView } from "./IconsView";

/** 3D 아이콘 미리보기 (개발 중에만 열려요) */
export default function IconsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <IconsView />;
}
