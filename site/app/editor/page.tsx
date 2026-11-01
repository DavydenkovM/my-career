import type { Metadata } from "next";
import { EditorClient } from "@/components/editor/EditorClient";

export const metadata: Metadata = {
  title: "Редакция",
  robots: { index: false, follow: false },
};

export default function EditorPage() {
  return <EditorClient />;
}
