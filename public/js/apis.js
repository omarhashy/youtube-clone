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
    setSubscribeButton(data.isSubscribed);
    showSuccess(data.message);
  } catch (error) {
    showError("Could not subscribe to the channel");
    console.error(error);
  }
};

const submitComment = async (videoId) => {
  const textarea = document.getElementById("commentTextarea");
  const comment = textarea.value;
  if (comment.trim() === "") {
    showError("Comment can not be empty");
    return;
  }

  if (comment.trim().length > 255) {
    showError("Comment can not have more than 255 chars");
    return;
  }
  textarea.value = "";

  try {
    const api = "/api/comment";
    const body = {
      videoId: videoId,
      comment: comment,
    };
    const response = await fetch(api, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Could not post the comment");
    }
    const data = await response.json();
    appendComments(data.comment, "afterbegin");

    showSuccess(data.message);
  } catch (error) {
    showError("Could not post the comment");
    console.error(error);
  }
};

let commentPage = 1;
let allCommentLoaded = false;
let isLoading = false;
const loadComments = async (videoId) => {
  if (allCommentLoaded) return;
  const api = `/api/comments/${videoId}?page=${commentPage}`;
  try {
    isLoading = true;
    const response = await fetch(api, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Could not post the comment");
    }
    const data = await response.json();
    commentPage++;
    if (data.comments.length === 0) {
      allCommentLoaded = true;
    }

    data.comments.forEach((comment) => appendComments(comment));
  } catch (error) {
    console.error(error);
  } finally {
    isLoading = false;
  }
};

const isCloseToBottom = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 10;
  return scrollPosition >= threshold;
};

const handleScroll = async () => {
  if (isCloseToBottom() && !isLoading) {
    console.log("User is close to the bottom of the page");
    await loadComments(videoId);
  }
};

window.addEventListener("scroll", handleScroll);
