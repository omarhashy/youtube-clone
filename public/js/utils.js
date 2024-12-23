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
