function showError(message) {
  // Create the error message container
  const errorDiv = document.createElement("div");
  errorDiv.innerText = message;
  errorDiv.style.position = "fixed";
  errorDiv.style.right = "2rem"; // Position at the right
  errorDiv.style.width = "18rem"; // Fixed width using rem
  errorDiv.style.padding = "1rem 1.25rem"; // Padding with rem
  errorDiv.style.backgroundColor = "rgba(244, 67, 54, 0.9)"; // Red with transparency
  errorDiv.style.color = "#fff";
  errorDiv.style.fontSize = "1rem"; // Font size using rem
  errorDiv.style.borderRadius = "0.5rem"; // Border radius using rem
  errorDiv.style.boxShadow = "0 0.25rem 0.5rem rgba(0, 0, 0, 0.2)"; // Box shadow with rem
  errorDiv.style.opacity = "1";
  errorDiv.style.transition = "opacity 0.5s ease";

  // Calculate the current position of the messages stack (based on the total number of messages)
  const allMessages = document.querySelectorAll(".message");
  const offset = allMessages.length * 5; // 5rem offset for each new message

  errorDiv.style.bottom = `${2 + offset}rem`; // Stack messages above each other

  // Add a class to help with identifying the message container
  errorDiv.classList.add("message");

  // Append the error message to the body
  document.body.appendChild(errorDiv);

  // Set timeout to fade out and remove the error message
  setTimeout(() => {
    errorDiv.style.opacity = "0";
    setTimeout(() => errorDiv.remove(), 500);
  }, 10000);
}

function showSuccess(message) {
  // Create the success message container
  const successDiv = document.createElement("div");
  successDiv.innerText = message;
  successDiv.style.position = "fixed";
  successDiv.style.right = "2rem"; // Position at the right
  successDiv.style.width = "18rem"; // Fixed width using rem
  successDiv.style.padding = "1rem 1.25rem"; // Padding with rem
  successDiv.style.backgroundColor = "rgba(76, 175, 80, 0.9)"; // Green with transparency
  successDiv.style.color = "#fff";
  successDiv.style.fontSize = "1rem"; // Font size using rem
  successDiv.style.borderRadius = "0.5rem"; // Border radius using rem
  successDiv.style.boxShadow = "0 0.25rem 0.5rem rgba(0, 0, 0, 0.2)"; // Box shadow with rem
  successDiv.style.opacity = "1";
  successDiv.style.transition = "opacity 0.5s ease";

  // Calculate the current position of the messages stack (based on the total number of messages)
  const allMessages = document.querySelectorAll(".message");
  const offset = allMessages.length * 5; // 5rem offset for each new message

  successDiv.style.bottom = `${2 + offset}rem`; // Stack messages above each other

  // Add a class to help with identifying the message container
  successDiv.classList.add("message");

  // Append the success message to the body
  document.body.appendChild(successDiv);

  // Set timeout to fade out and remove the success message
  setTimeout(() => {
    successDiv.style.opacity = "0";
    setTimeout(() => successDiv.remove(), 500);
  }, 10000);
}

function showMessages(errors, successes) {
  // Show all error messages
  errors.forEach((message) => {
    showError(message);
  });

  // Show all success messages
  successes.forEach((message) => {
    showSuccess(message);
  });
}
