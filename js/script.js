/**
 * @copyright codewithsadee 2023
 * @author Sadee <codewithsadee24@gmail.com>
 */

"use strict";


/**
 * Light and dark mode
 */

const /** {NodeElement} */ $themeBtn = document.querySelector("[data-theme-btn]");
const /** {NodeElement} */ $HTML = document.documentElement;
let /** {Boolean | String} */ isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (sessionStorage.getItem("theme")) {
  $HTML.dataset.theme = sessionStorage.getItem("theme");
} else {
  $HTML.dataset.theme = isDark ? "dark" : "light";
}

const changeTheme = () => {

  $HTML.dataset.theme = sessionStorage.getItem("theme") === "light" ? "dark" : "light";
  sessionStorage.setItem("theme", $HTML.dataset.theme);

}

$themeBtn.addEventListener("click", changeTheme);


/**
 * TAB
 */

const /** {NodeList} */ $tabBtn = document.querySelectorAll("[data-tab-btn]");
let /** {NodeElement} */[lastActiveTab] = document.querySelectorAll("[data-tab-content]");
let /** {NodeElement} */[lastActiveTabBtn] = $tabBtn;

$tabBtn.forEach(item => {
  item.addEventListener("click", function () {

    lastActiveTab.classList.remove("active");
    lastActiveTabBtn.classList.remove("active");

    const /** {NodeElement} */ $tabContent = document.querySelector(`[data-tab-content="${item.dataset.tabBtn}"]`);
    $tabContent.classList.add("active");
    this.classList.add("active");

    lastActiveTab = $tabContent;
    lastActiveTabBtn = this;

  });
});

/**
 * View Counter
 */

const counter =  document.querySelector(".view-counter");
async function updateCounter() {
  let response = await fetch("https://2fkl427wfut42nncdvvfogaibi0nvnkl.lambda-url.us-east-1.on.aws");
  let data = await response.json();
  counter.innerHTML = `Built with ❤️ | Visitors: ${data}`;
}

updateCounter();

/**
 * Email Script
 */
document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById('myForm');
  
  form.addEventListener('submit', function(e) {
      // Prevent the default form submission
      e.preventDefault();
      
      // Gather form data
      const formData = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          subject: document.getElementById('subject').value,
          message: document.getElementById('message').value
      };
      
      // API Gateway endpoint URL
      const apiGatewayUrl = "https://hjp2xotrjf.execute-api.us-east-1.amazonaws.com/dev";
      
      // Send a POST request to the API Gateway endpoint
      fetch(apiGatewayUrl, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
      })
      .then(response => {
          if (response.ok) {
              return response.json(); // or .text() if the response is not in JSON format
          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          console.log("Success:", data);
          // Here you can handle the successful submission, e.g., showing a success message
      })
      .catch(error => {
          console.error("Error:", error);
          // Here you can handle the error, e.g., showing an error message
      });
  });
});