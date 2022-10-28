import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Button,
  Avatar,
} from "@chakra-ui/react";

import type { Session } from "next-auth";

interface HeaderProps {
  isMobile: boolean | null;
  session: Session | null;
  onLeaderboardOpen: () => void;
  signIn: () => void;
  signOut: () => void;
}

export default function Header(props: HeaderProps) {
  return (
    <Box className="bg-darkBgAlpha text-center py-4">
      <div className="flex flex-row w-100">
        <div className="mx-auto">
          {props.isMobile ? (
            <h1 className="mr-[8rem] font-extrabold text-4xl text-[#319795]">
              Typist
            </h1>
          ) : (
            <h1 className="ml-[11rem] font-extrabold text-4xl text-[#319795]">
              Typist
            </h1>
          )}
        </div>
        <div>
          <Button className="mr-5" onClick={() => props.onLeaderboardOpen()}>
            Rankings
          </Button>
        </div>
        {props.session ? (
          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                className="mr-5 mt-1"
                name={props.session.user?.name ? props.session.user.name : ""}
                src={props.session.user?.image ? props.session.user.image : ""}
              />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => props.signOut()}>Sign Out</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button className="mr-5 pl-5" onClick={() => props.signIn()}>
            Sign In
          </Button>
        )}
      </div>
    </Box>
  );
}
