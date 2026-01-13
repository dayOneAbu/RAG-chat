import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import { MainHeader } from "./_components/layout/main-header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="am" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen">
        <SessionProvider>
          <TRPCReactProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <MainHeader />
              <div className="pt-[72px] pb-[64px] h-screen">
                {children}
              </div>
              {/* The input box should be rendered in a fixed div at the bottom. Replace <ChatInput /> with your actual input component if needed. */}
              {/* <div className="fixed bottom-0 left-0 right-0 z-50 bg-card">
<ChatInput /> 
              </div> */}
            </ThemeProvider>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
