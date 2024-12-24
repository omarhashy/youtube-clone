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

const submitSubscribe = async (channelHandel) => {
  const api = "/api/subscribe";
  const body = {
    channelHandel: channelHandel,
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
      throw new Error("Could not subscribe to the channel");
    }

    const data = await response.json();
    console.log(data);
    setSubscribeButton(data.isSubscribed);
    showSuccess(data.message);
  } catch (error) {
    showError("Could not subscribe to the channel");
    console.error(error);
  }
};
