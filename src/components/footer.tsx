import { useState, useEffect } from "react";

import {
  Avatar,
  Badge,
  Center,
  Divider,
  Text,
  Stack,
  Spacer,
  Icon,
  IconButton,
} from "@chakra-ui/react";

import { FaGithub } from "react-icons/fa";
import { Octokit } from "@octokit/core";

interface gitRepoData {
  commiter: string;
  avatar: string;
  hash: string;
  message: string;
  url: string;
}

interface FooterProps {
  isMobile: boolean | null;
}

export default function Footer(props: FooterProps) {
  const [lastCommitData, setLastCommitData] = useState<gitRepoData | null>(
    null
  );

  useEffect(() => {
    // Get latest commit from github api
    if (!lastCommitData) {
      const octokit = new Octokit({});
      const fetchRepoData = async () => {
        const response = await octokit.request(
          "GET /repos/{owner}/{repo}/commits",
          {
            owner: "antonio-hickey",
            repo: "Typist",
          }
        );
        if (response !== null) {
          setLastCommitData({
            commiter: response.data[0]?.author?.html_url!,
            message: response.data[0]?.commit.message!,
            hash: response.data[0]?.sha!,
            avatar: response.data[0]?.author?.avatar_url!,
            url: response.data[0]?.html_url!,
          });
        }
      };
      fetchRepoData();
    }
  }, [lastCommitData]);

  return (
    <footer className="bg-darkBgAlpha text-center">
      <Stack direction={"row"} className="!text-center px-5 pt-7 pb-3">
        {props.isMobile ? null : (
          <>
            <Text className="pl-5">Last Commit:</Text>
            <a href={lastCommitData?.commiter}>
              <Avatar
                src={lastCommitData?.avatar}
                size="sm"
                className="!mt-[-0.2rem]"
              />
            </a>
            <Badge
              colorScheme={"teal"}
              className="h-5 !mt-[0.17rem] !lowercase"
            >
              <a href={lastCommitData?.url}>
                {lastCommitData?.hash.slice(0, 7)}
              </a>
            </Badge>
            <Text>
              <a
                href={lastCommitData?.url}
                className="underline underline-offset-2"
              >
                {lastCommitData?.message}
              </a>
            </Text>
            <Spacer />
            <Center height="2rem">
              <Divider orientation="vertical" />
            </Center>
          </>
        )}
        <Spacer />

        <Text className="underline underline-offset-4">
          <a href="https://github.com/antonio-hickey/Typist">
            View source code on GitHub
          </a>
        </Text>
        <IconButton
          variant="subtle"
          colorScheme="teal"
          aria-label="GitHub"
          fontSize="2.5rem"
          icon={<Icon as={FaGithub} className="!mt-[-0.75rem]" />}
          className="!pr-1.5"
        />
      </Stack>
    </footer>
  );
}
