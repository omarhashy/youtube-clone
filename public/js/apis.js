const submitLike = async (id) => {
  const api = "/api/like";
  const body = {
    videoId: id,
  };
  try {
    const response = await fetch(api, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Could not like the video");
    }

    const data = await response.json();
    console.log(data);
    setLikeButton(data.isLiked);
    showSuccess(data.message);
  } catch (error) {
    showError("Could not like the video");
    console.error(error);
  }
};
