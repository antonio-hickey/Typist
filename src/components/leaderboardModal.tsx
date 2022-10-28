import { useState, useEffect } from "react";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";

import { User } from "@prisma/client";

interface LeaderboardModalProps {
  baseUrl: string;
  isLeaderboardOpen: boolean;
  onLeaderboardClose: () => void;
}

export default function LeaderboardModal(props: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<User[] | null>(null);

  const getLeaderboard = () => {
    fetch(props.baseUrl + "/api/score/leaderboard")
      .then((resp) => resp.json())
      .then((data) => {
        setLeaderboard(data.users);
      });
  };

  useEffect(() => {
    // Get leaderboard data
    if (!leaderboard) getLeaderboard();
  }, [leaderboard]);

  return (
    <Modal
      isOpen={props.isLeaderboardOpen}
      onClose={props.onLeaderboardClose}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Leaderboard</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th>Name</Th>
                  <Th isNumeric>Score</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboard != null
                  ? leaderboard.map((user, i) => {
                      return (
                        <Tr key={i}>
                          <Td>
                            <Avatar
                              size="xs"
                              name={user.name ? user.name : ""}
                              src={user.image ? user.image : ""}
                            />
                          </Td>
                          <Td>{user.name}</Td>
                          <Td isNumeric>{user.highScore}</Td>
                        </Tr>
                      );
                    })
                  : null}
              </Tbody>
              <Tfoot></Tfoot>
            </Table>
          </TableContainer>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
