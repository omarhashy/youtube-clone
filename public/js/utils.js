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

const vis = new Set();
const appendComments = (comment, align = "beforeend") => {
  if (vis.has(comment.id)) {
    return;
  }
  vis.add(comment.id);
  const htmlString = `
  <div class="comment-item">
  <img
    src="${comment.channelInfo.channelPictureUrl}"
    alt="channel image"
  />
  <div class="comment-item-comment">
    <h2>${comment.channelInfo.name}</h2>
    <p class="comment-content">
      ${comment.content}
    </p>
  </div>
</div>
  `;
  const targetDiv = document.getElementById("comments-box");
  targetDiv.insertAdjacentHTML(align, htmlString);
};
