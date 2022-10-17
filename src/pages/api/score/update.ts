import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let reqBody = JSON.parse(req.body);

  try {
    await prisma.user.update({
      where: {
        id: reqBody.userId,
      },
      data: {
        highScore: reqBody.highScore,
      },
    });
    res.status(200).json({ msg: "updated high score!" });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    res.status(500).json({ msg: message });
  }
}
