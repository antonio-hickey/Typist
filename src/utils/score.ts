const updateHighScore = (
  baseUrl: string,
  userId: string,
  highScore: number
): void => {
  fetch(baseUrl + "/api/score/update", {
    method: "post",
    body: JSON.stringify({
      userId: userId,
      highScore: highScore,
    }),
  });
};

export { updateHighScore };
