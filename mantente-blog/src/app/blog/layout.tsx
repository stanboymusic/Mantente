import Script from "next/script";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9518260713755284"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}