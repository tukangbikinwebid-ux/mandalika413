import DefaultHeader from "@/components/layout/header";

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DefaultHeader />
      {/* <DefaultHeader showNavigationBars={true} /> */}
      <main className="md:pt-36 pt-26 min-h-screen flex flex-col font-sans">
        <div className="flex-1">{children}</div>
      </main>
    </>
  );
}
