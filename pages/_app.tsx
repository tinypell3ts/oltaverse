import type { OnboardAPI } from "@web3-onboard/core";
import { useConnectWallet, useWallets } from "@web3-onboard/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "react-query";
import { Header } from "../components";
import { initOnboard } from "../services";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const [{ wallet }, connect] = useConnectWallet();
  const connectedWallets = useWallets();
  const [onboard, setOnboard] = useState<OnboardAPI>();

  useEffect(() => {
    setOnboard(initOnboard);
  }, []);

  useEffect(() => {
    if (!connectedWallets.length) return;

    const connectedWalletsLabelArray = connectedWallets.map(
      ({ label }) => label
    );
    window.localStorage.setItem(
      "connectedWallets",
      JSON.stringify(connectedWalletsLabelArray)
    );
  }, [connectedWallets]);

  useEffect(() => {
    const previouslyConnectedWallets = JSON.parse(
      window.localStorage.getItem("connectedWallets")
    );

    if (previouslyConnectedWallets?.length) {
      async function setWalletFromLocalStorage() {
        await connect({ autoSelect: previouslyConnectedWallets[0] });
      }
      setWalletFromLocalStorage();
    }
  }, [onboard, connect]);

  useEffect(() => {
    if (!wallet?.provider) {
      window.localStorage.removeItem("connectedWallets");
    }
  }, [wallet]);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  });

  return (
    <>
      <Head>
        <meta property="og:title" content="Olta Island" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://oltaisland.netlify.app/" />
        <meta
          property="og:image"
          content="https://oltaisland.netlify.app/images/preview.png"
        />
        <meta property="og:description" content="Welcome to the island 🏝" />
      </Head>
      <div className=" h-screen w-screen bg-indigo-500">
        <QueryClientProvider client={queryClient}>
          <Header />
          <Component {...pageProps} />
          <Toaster />
        </QueryClientProvider>
      </div>
    </>
  );
}

export default MyApp;
