import "./globals.css";

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div>Minimal Layout</div>
        {children}
      </body>
    </html>
  );
}
