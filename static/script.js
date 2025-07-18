function toggleChat() {
      const chatWindow = document.getElementById("chatWindow");
      chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
    }

    async function sendMessage() {
      const input = document.getElementById("userInput");
      const message = input.value.trim();
      if (!message) return;

      const chatMessages = document.getElementById("chatMessages");

      const userMsg = document.createElement("div");
      userMsg.className = "message user-message";
      userMsg.textContent = message;
      chatMessages.appendChild(userMsg);

      const botMsg = document.createElement("div");
      botMsg.className = "message bot-message";
      botMsg.textContent = "Thinking...";
      chatMessages.appendChild(botMsg);
      try {
        const response = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        });
        const data = await response.json();
        botMsg.innerHTML = data.reply
          .replace(/\n/g, "<br>")
          .replace(/\* (.+?)(?=\n|<br>|$)/g, "• $1<br>");
      } catch (error) {
        botMsg.textContent = "Error: Could not contact the bot.";
      }


      input.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }


    // 🔁 Function to show a specific page and hide the rest
    function showPage(pageId) {
      document.querySelectorAll(".page").forEach(section => {
        section.style.display = "none"; // hide all
      });
      document.getElementById(pageId).style.display = "block"; // show selected
    }

    // 🏠 NAVIGATION: Show Home Page when "HOME" is clicked
    document.querySelector('a[href="#home"]').addEventListener("click", e => {
      e.preventDefault();
      showPage("home-page"); // show home section
    });

    // 🍽️ NAVIGATION: Show Recipe Category Page when "RECIPES" is clicked
    document.querySelector('a[href="#recipes"]').addEventListener("click", e => {
      e.preventDefault();
      showPage("recipe-category-page"); // show category section
    });

    // ============================
    // 🏠 HOME PAGE: Load all recipes into home section
    // ============================
    fetch("/recipes.json")
      .then(res => res.json())
      .then(recipes => {
        const recipeContainer = document.getElementById("recipe-list");
        recipes.forEach(recipe => {
          const card = document.createElement("div");
          card.className = "recipe-card";
          card.innerHTML = `
      <img src="/static/images/${recipe.image}" alt="${recipe.recipe_name}">
        <div style="padding: 1rem;">
          <h3>${recipe.recipe_name}</h3>
          <ul>
            ${recipe.ingredients.map(ing => `<li>${ing.quantity} ${ing.item}</li>`).join("")}
          </ul>
          <h4>Steps:</h4>
          <ol>
            ${recipe.steps ? recipe.steps.map(step => `<li>${step}</li>`).join("") : '<li>No steps provided.</li>'}
          </ol>
        </div>
        `;
          recipeContainer.appendChild(card);
        });
      });

    // ============================
    // 🍽️ RECIPE CATEGORY PAGE: Load and filter recipes by category
    // ============================
    let allRecipes = [];
    fetch("/recipes.json")
      .then(res => res.json())
      .then(recipes => {
        allRecipes = recipes; // save all for filtering
      });

    // Function to display filtered recipes
    function displayRecipes(recipes) {
      const container = document.getElementById("recipe-category");
      container.innerHTML = "";
      if (recipes.length === 0) {
        container.innerHTML = "<p>No recipes found for this category.</p>";
        return;
      }

      recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
        <img src="/static/images/${recipe.image}" alt="${recipe.recipe_name}">
          <div style="padding: 1rem;">
            <h3>${recipe.recipe_name}</h3>
            <ul>
              ${recipe.ingredients.map(ing => `<li>${ing.quantity} ${ing.item}</li>`).join("")}
            </ul>
            <h4>Steps:</h4>
            <ol>
              ${recipe.steps ? recipe.steps.map(step => `<li>${step}</li>`).join("") : '<li>No steps provided.</li>'}
            </ol>
          </div>
          `;
        container.appendChild(card);
      });
    }

    // Handle category button clicks
    document.querySelectorAll(".category-button").forEach(button => {
      button.addEventListener("click", () => {
        const category = button.dataset.category;
        const filtered = allRecipes.filter(r =>
          r.category.toLowerCase().replace(" ", "-") === category.toLowerCase()
        );
        displayRecipes(filtered);
      });
    });



    const toggleBtn = document.getElementById("darkModeToggle");

    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
      toggleBtn.textContent = "☀️";
    }

    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      toggleBtn.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });

    function toggleLoginModal() {
      const modal = document.getElementById("loginModal");
      modal.style.display = modal.style.display === "block" ? "none" : "block";
    }

    function toggleSignupModal() {
      const modal = document.getElementById("signupModal");
      modal.style.display = modal.style.display === "block" ? "none" : "block";
    }


    document.querySelector('nav a[href="#"]:nth-child(4)').addEventListener("click", (e) => {
      e.preventDefault();
      toggleLoginModal();
    });


    function handleLogin() {
      const username = document.getElementById("loginUsername").value;
      const password = document.getElementById("loginPassword").value;
      const status = document.getElementById("loginStatus");

      fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            status.style.color = "green";
            status.textContent = "Login successful!";

            // Replace dropdown with greeting
            const userMenu = document.querySelector(".user-menu");
            userMenu.innerHTML = `<span class="user-greeting">Hi, ${data.name}</span>`;

            // ✅ Load saved chat messages
            loadChatHistory();

            setTimeout(() => {
              toggleLoginModal();
              alert(data.message);
            }, 1000);
          } else {
            status.style.color = "red";
            status.textContent = data.message;
          }
        })
        .catch(err => {
          status.style.color = "red";
          status.textContent = "An error occurred.";
        });
    }


    function handleSignup() {
      const name = document.getElementById("signupName").value.trim();
      const username = document.getElementById("signupUsername").value.trim();
      const password = document.getElementById("signupPassword").value;
      const status = document.getElementById("signupStatus");

      if (!name || !username || !password) {
        status.style.color = "red";
        status.textContent = "Please fill in all fields.";
        return;
      }

      fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password }),
      })
        .then(res => res.json())
        .then(data => {
          status.style.color = data.success ? "green" : "red";
          status.textContent = data.message;
          if (data.success) {
            setTimeout(() => {
              toggleSignupModal();
              alert(`Welcome, ${name}! Your account has been created.`);
            }, 1000);
          }
        })
        .catch(err => {
          status.style.color = "red";
          status.textContent = "Server error.";
          console.error(err);
        });
    }

    async function loadChatHistory() {
      try {
        const res = await fetch("/history");
        if (!res.ok) return;
        const messages = await res.json();

        const chatMessages = document.getElementById("chatMessages");
        chatMessages.innerHTML = "";

        messages.forEach(msg => {
          const div = document.createElement("div");
          div.className = msg.sender === "user" ? "user-message" : "bot-message";
          div.textContent = msg.message;
          chatMessages.appendChild(div);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
      } catch (err) {
        console.error("Error loading chat history", err);
      }
    }

    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        card.innerHTML = `
            <img src="/static/images/${recipe.image}" alt="${recipe.recipe_name}">
            <div class="recipe-card-title">${recipe.recipe_name}</div>
            <div class="recipe-card-content">
                <div class="recipe-details">
                    <h3>${recipe.recipe_name}</h3>
                    <div class="recipe-ingredients">
                        <h4>Ingredients:</h4>
                        <ul>
                            ${recipe.ingredients.map(ing => `
                                <li>${ing.quantity} ${ing.item}${ing.notes ? ` (${ing.notes})` : ''}</li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="recipe-instructions">
                        <h4>Instructions:</h4>
                        <ol>
                            ${recipe.instructions ? recipe.instructions.map(step => `
                                <li>${step}</li>
                            `).join('') : '<li>Instructions not available</li>'}
                        </ol>
                    </div>
                </div>
            </div>
        `;

        // Toggle card expansion on click
        card.addEventListener('click', (e) => {
            // Don't toggle if clicking inside the content when expanded
            if (card.classList.contains('expanded') && 
                e.target.closest('.recipe-card-content') && 
                !e.target.closest('.recipe-close')) {
                return;
            }
            
            // Close any other expanded cards
            document.querySelectorAll('.recipe-card.expanded').forEach(expandedCard => {
                if (expandedCard !== card) {
                    expandedCard.classList.remove('expanded');
                }
            });
            
            // Toggle current card
            card.classList.toggle('expanded');
        });

        return card;
    }

    // Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.getElementById('searchBar');
    const searchButton = document.getElementById('searchButton');

    function performSearch() {
        // Get search text and remove existing highlights
        const searchText = searchBar.value.toLowerCase().trim();
        removeHighlights();

        if (searchText.length < 2) return; // Minimum 2 characters to search

        const recipeCards = document.querySelectorAll('.recipe-card');
        let firstMatch = null;
        let found = false;

        recipeCards.forEach(card => {
            // Check both title and content
            const titleElement = card.querySelector('.recipe-card-title');
            const contentElement = card.querySelector('.recipe-card-content');
            
            const titleText = titleElement.textContent.toLowerCase();
            const contentText = contentElement.textContent.toLowerCase();

            if (titleText.includes(searchText) || contentText.includes(searchText)) {
                found = true;
                if (!firstMatch) {
                    firstMatch = card;
                }

                // Highlight matches
                if (titleText.includes(searchText)) {
                    highlightText(titleElement, searchText);
                }
                if (contentText.includes(searchText)) {
                    highlightText(contentElement, searchText);
                }

                // Show the content if it contains the match
                if (contentText.includes(searchText)) {
                    card.classList.add('expanded');
                }
            }
        });

        // Scroll to first match
        if (firstMatch) {
            firstMatch.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            // Add pulse animation
            firstMatch.classList.add('found');
            setTimeout(() => {
                firstMatch.classList.remove('found');
            }, 2000);
        }
    }

    function removeHighlights() {
        document.querySelectorAll('.highlight').forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });
        document.querySelectorAll('.recipe-card.expanded').forEach(card => {
            card.classList.remove('expanded');
        });
    }

    function highlightText(element, searchText) {
        const innerHTML = element.innerHTML;
        const text = element.textContent;
        const index = text.toLowerCase().indexOf(searchText.toLowerCase());
        
        if (index >= 0) {
            const before = text.substring(0, index);
            const match = text.substring(index, index + searchText.length);
            const after = text.substring(index + searchText.length);
            element.innerHTML = `${before}<span class="highlight">${match}</span>${after}`;
        }
    }

    // Event Listeners
    searchButton.addEventListener('click', performSearch);
    
    searchBar.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Real-time search with debounce
    searchBar.addEventListener('input', debounce(performSearch, 300));
});

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}