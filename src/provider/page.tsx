"use client";
import { UserProvider } from "@/context/user-context";
import { SDKProvider } from "@telegram-apps/sdk-react";
import { isTMA } from "@telegram-apps/sdk-react";
import React, { useEffect, useState } from "react";
import { LandingPage } from "@/components/landing-page";
import { MetaMaskProvider } from "@metamask/sdk-react";

export default function TelegramProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInTelegramWebApp, setIsInTelegramWebApp] = useState(false);

  useEffect(() => {
    isTMA().then((isInTelegramWebApp) => {
      setIsInTelegramWebApp(isInTelegramWebApp);
    });
  }, []);

  return (
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "Example React Dapp",
        },
        infuraAPIKey: process.env.INFURA_API_KEY,
      }}
    >
    <SDKProvider acceptCustomStyles debug>
      {isInTelegramWebApp ? (
        <UserProvider>{children}</UserProvider>
      ) : (
        <LandingPage />
      )}
    </SDKProvider>
    </MetaMaskProvider>
  );
}
