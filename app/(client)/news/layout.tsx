export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen flex flex-col font-sans">
        <div className="flex-1">{children}</div>
      </main>
    </>
  );
}
