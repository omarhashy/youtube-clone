const setLikeButton = (isLiked) => {
  const button = document.getElementById("likeButton");
  if (isLiked) {
    button.textContent = "Unlike";
    button.style.backgroundColor = "black";
    button.style.color = "white";
  } else {
    button.textContent = "Like";
    button.style.backgroundColor = "rgba(0, 0, 0, 0.199)";
    button.style.color = "black";
  }
};


const setSubscribeButton = (isSubscribed) => {
  const button = document.getElementById("subscribeButton");
  if (isSubscribed) {
    button.textContent = "Unsubscribe";
    button.style.backgroundColor = "black";
  } else {
    button.textContent = "Subscribe";
    button.style.backgroundColor = "rgb(185, 6, 6)";
  }
};
