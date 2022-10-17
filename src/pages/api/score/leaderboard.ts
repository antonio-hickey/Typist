import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let topTenUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        highScore: "desc",
      },
    });
    res.status(200).json({ msg: "Grabbed top 10 users", users: topTenUsers });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    res.status(500).json({ msg: message });
  }
}
