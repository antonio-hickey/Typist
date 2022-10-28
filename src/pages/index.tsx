import type { NextPage } from "next";
import Head from "next/head";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useDisclosure } from "@chakra-ui/react";

import Header from "./../components/header";
import Footer from "./../components/footer";
import GameBox from "./../components/gameBox";
import LeaderboardModal from "../components/leaderboardModal";

const Home: NextPage = () => {
  const [width, setWidth] = useState(
    typeof window === "undefined" ? 0 : window.innerWidth
  );
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const { data: session } = useSession();
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [isSessStorageSet, setIsSessStorageSet] = useState<boolean>(false);
  const {
    isOpen: isLeaderboardOpen,
    onOpen: onLeaderboardOpen,
    onClose: onLeaderboardClose,
  } = useDisclosure();

  const updateDimensions = () => {
    if (typeof window !== "undefined") {
      setWidth(window.innerWidth);
    }
  };

  useEffect(() => {
    // Check if mobile on screen resize
    window.addEventListener("resize", updateDimensions);
    if (width < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
    return () => window.removeEventListener("resize", updateDimensions);
  }, [width]);

  useEffect(() => {
    // Set the base url for api endpoints
    if (baseUrl == "") {
      setBaseUrl(window.location.href);
    }
  }, [baseUrl]);

  useEffect(() => {
    /*
      Initialize item in session storage for keeping
      track of characters the user failed.
    */
    if (!isSessStorageSet) {
      sessionStorage.setItem("failedChars", "");
      setIsSessStorageSet(true);
    }
  }, [isSessStorageSet]);

  return (
    <div className="mainBodyDark flex flex-col min-h-[100vh] max-h-[100vh] justify-between h-screen">
      <Head>
        <title>Typist</title>
        <meta
          name="description"
          content="App to learn fast and accurate typing."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header
        session={session}
        isMobile={isMobile}
        onLeaderboardOpen={onLeaderboardOpen}
        signOut={signOut}
        signIn={signIn}
      />

      <GameBox session={session} baseUrl={baseUrl} />

      <LeaderboardModal
        baseUrl={baseUrl}
        isLeaderboardOpen={isLeaderboardOpen}
        onLeaderboardClose={onLeaderboardClose}
      />

      <Footer isMobile={isMobile} />
    </div>
  );
};

export default Home;
