// Instanciate the Classes
const ui = new UI();
cocktail = new CocktailAPI(),
cocktailDB = new CocktailDB();

// Create Event Listeners
function eventListeners() {
    // Document Ready
    document.addEventListener('DOMContentLoaded', documentReady);

    // Add event Listener when form is submitted
    const searchForm= document.querySelector('#search-form');
    if(searchForm) {
        searchForm.addEventListener('submit', getCocktails);
    }
    
    // The results div listeners
    const resultsDiv = document.querySelector('#result');
    if(resultsDiv) {
        resultsDiv.addEventListener('click', resultsDelegation);
    }
}

eventListeners();



// Get cocktails function
function getCocktails(e){
    e.preventDefault();

    const searchTerm = document.querySelector('#search').value;

    // Check something is on the search input
    if(searchTerm === '') {
        // Call User Interface print message
        ui.printMessage('Please add something into the form', 'danger');
    } else {
        // Server response from promise
        let serverResponse;

        // type of search (ingredients, cocktails, or name)
        const type = document.querySelector('#type').value;

        // Evaluate the type of method and then execute the query

        switch(type) {
            case 'name':
                serverResponse = cocktail.getDrinksByName(searchTerm);
                break;
            case 'ingredient':
                serverResponse = cocktail.getDrinksByIngredients(searchTerm);
                break;
            case 'category':
                serverResponse = cocktail.getDrinksByCategory(searchTerm);
                break;
            case 'alcohol':
                serverResponse = cocktail.getDrinksByAlcohol(searchTerm);
                break;
        }

        ui.clearResults();

        // Query by the name of the drinks

        serverResponse.then(cocktails => {
             if(cocktails.cocktails.drinks === null){
                 // Nothing Exists
                 ui.printMessage('There\'re no results, try a different term', 'danger');
             } else {
                if(type === 'name') {
                    // Display with ingredients
                    ui.displayDrinksWithIngredients(cocktails.cocktails.drinks);
                } else {
                    // Display without ingredients (category, alcohol, ingredients)
                    ui.displayDrinksWithIngredients(cocktails.cocktails.drinks);
                }
             }
         })
    }
    }

// Delegation for the #results area
function resultsDelegation(e) {
    e.preventDefault();

    if(e.target.classList.contains('get-recipe')) {
        cocktail.getSingleRecipe( e.target.dataset.id )
            .then(recipe => {
                // Displays single recipe into a modal
                ui.displaySingleRecipe( recipe.recipe.drinks[0] );

            })
    }

    // When favorite btn is clicked
    if(e.target.classList.contains('favorite-btn')){
        if(e.target.classList.contains('is-favorite') ) {
            // remove the class
            e.target.classList.remove('is-favorite');
            e.target.textContent = '+';

            // Remove from Storage 
            cocktailDB.removeFromDB(e.target.dataset.id);
        } else {
            //Add the class
            e.target.classList.add('is-favorite');
            e.target.textContent = '-';

            // Get info
            const cardBody = e.target.parentElement;

            const drinkInfo = {
                id: e.target.dataset.id,
                name: cardBody.querySelector('.card-title').textContent,
                image: cardBody.querySelector('.card-img-top').src,
            }

            // console.log(drinkInfo);
            //Add into the storage
            cocktailDB.saveIntoDB(drinkInfo);


        }
    }
}

// Document Ready
function documentReady() {
    // Display on load the favorites from storage
    ui.isFavorite();

    //Select the search category select
    const searchCategory = document.querySelector('.search-category');
    if(searchCategory) {
        ui.displayCategories();
    }

    // When favorite page 
    const favoritesTable = document.querySelector('#favorites');
    if(favoritesTable) {
        // Get the favorites from storage and display them
        const drinks = cocktailDB.getFromDB();
        ui.displayFavorites(drinks);

        // When view or delete are clicked

        favoritesTable.addEventListener('click', (e) => {
            e.preventDefault();

            // Delegation
            if(e.target.classList.contains('get-recipe')) {
                cocktail.getSingleRecipe( e.target.dataset.id)
                .then(recipe => {
                    // Displays single recipe into a modal
                    ui.displaySingleRecipe( recipe.recipe.drinks[0] );
    
                })
            }

            // When remove button is clicked in favorites
            if(e.target.classList.contains('remove-recipe')) {
                // Remove from dom
                ui.removeFavorite(e.target.parentElement.parentElement);

                // Remove from the Local Storage
                cocktailDB.removeFromDB(e.target.dataset.id);
            }
        })

    }
}

