import DefaultLayout from "@/components/layout/default-layout";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
