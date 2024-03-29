// COOKIES, userid and username
const cookieArr = document.cookie.split("=")
const userId = cookieArr[1];
const userFirstname = cookieArr[2];

// DOM Elements - grab elements from the DOM
    // google book api
const submitForm = document.getElementById("google-form")
const noteContainer = document.getElementById("note-container")
    // bookshelf
const bookshelfContainer = document.getElementById("bookshelf-container")
    // book review
const reviewContainer = document.getElementById("review-container")
    // misc
const userName = document.getElementById("userName")
const submitBookForm = document.getElementById("book-form")

// Book Review Modal DOM Elements
let reviewBody = document.getElementById(`review-body`)
let closeReviewBtn = document.getElementById('close-review-button')
    // post (initial) review (from google search)
let addReviewBtn = document.getElementById('add-review-button')
    // put review (from bookshelf books)
let putBookshelfReviewBtn = document.getElementById('put-bookshelf-review-button')


// HEADERS
const headers = {
    'Content-Type' : 'application/json'
}

// Backend link to POST Google API url
const baseUrl = 'http://localhost:8080/api/v1/bookapi/'    // Google search book
const bookUrl = 'http://localhost:8080/api/v1/books/'
const currentUrl = 'http://localhost:8080/api/v1/current/'        // current list


//   1. HANDLE LOGOUT
function handleLogout(){
    let c = document.cookie.split(";");
    for(let i in c){
        document.cookie = /^[^=]+/.exec(c[i])[0]+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
}

//   2. ADD USER FIRST NAME TO HOME PAGE
document.getElementById("userName").innerText = userFirstname

//   3. HANDLE GOOGLE BOOK SEARCH (GOOGLE API)
const handleBookSearchSubmit = async (e) => {
    e.preventDefault() //prevent default behavior of the form
    let userBookInputString = document.getElementById('search-input').value  // store search-input value
    console.log(userBookInputString); // log user request string
    await bookSearch(userBookInputString);  // run book search function below
    document.getElementById("search-input").value = ''  // reset search-input value to empty
}
async function bookSearch(obj) {
    const response = await fetch(`${baseUrl}`, {  // google search api endpoint
        method: "POST",
        body: JSON.stringify(obj),
        headers: headers
    })
        .catch(err => console.error(err.message))

    const result = await response.json()
    console.log(result);    // result is an array of 10 items
    if (response.status == 200) {
        // show 'search result' text
        document.getElementById("searchResultText").style.display = "block";
        document.getElementById("searchResultText").innerText = `Search results for "${obj}"`
        return createNoteCards(result);
    }
}

//   4. ADD GOOGLE SEARCHED BOOK TO BOOKSHELF DATABASE
async function handleAddToBookshelf(bookArrData){
    let bodyObj = {
        "title": bookArrData[0],
        "published": bookArrData[1],
        "description": bookArrData[2],
        "smallThumbnail": bookArrData[3],
        "thumbnail": bookArrData[4],
        "authors": bookArrData[5],
        "infoLink": bookArrData[6],
        "bookshelf": true
    }
    const response = await fetch(`${bookUrl}user/${userId}`, {
        method: "POST",
        body: JSON.stringify(bodyObj),
        headers: headers
    })
        .catch(err => console.error(err.message))
    if (response.status == 200) {
          console.log("book added to database")
          return getBookshelf(userId);      // run getBookshelf
    }
}

//   5. ADD GOOGLE BOOK (INITIAL) REVIEW TO DATABASE
async function handleReviewModal(bookArrData){
    // show modal; add initial book review button;
        // hide edit review/add to existing bookshelf book button
    putBookshelfReviewBtn.style.display = "none"
    addReviewBtn.style.display = "block"

    let bodyObj = {
        "title": bookArrData[0],
        "published": bookArrData[1],
        "description": bookArrData[2],
        "smallThumbnail": bookArrData[3],
        "thumbnail": bookArrData[4],
        "authors": bookArrData[5],
        "infoLink": bookArrData[6]
    }
    populateAddReviewModal(bodyObj)    // run Modal function in helper
}


//   6. GET USER'S BOOKSHELF (IF TRUE) ASSOCIATED WITH USERID ON PAGE LOAD
async function getBookshelf(userId) {
    await fetch(`${bookUrl}bookshelf/user/${userId}`, {
        method: "GET",
        headers: headers
    })
        .then(response => response.json())
        .then(data => createBookshelfCards(data))  // run create cards below (helper function)
        .catch(err => console.error(err))
}


//   7. GET USER'S REVIEWS (IF BOOKSHELF FALSE) ASSOCIATED WITH USERID ON PAGE LOAD
async function getReviews(userId) {
    await fetch(`${bookUrl}review/user/${userId}`, {
        method: "GET",
        headers: headers
    })
        .then(response => response.json())
        .then(data => createReviewCards(data))  // run create cards below (helper function)
        .catch(err => console.error(err))
}


//   8.  GET and UPDATE/PUT a bookshelf book with a review which will involve
    // a separate GET request for that book and then a PUT for that book
async function getBookById(bookId){
    // hide modal 'add initial book review' button;
    // only show 'add review to existing bookshelf book' button (toggle btw buttons)
    addReviewBtn.style.display = "none"
    putBookshelfReviewBtn.style.display = "block"

    await fetch(bookUrl + bookId, {
        method: "GET",
        headers: headers
    })
        .then(res => res.json())
        .then(data =>   {
                // console.log(data)
                populateAddReviewModal(data)}    // run populate modal below (helper function)
            )
        .catch(err => console.error(err.message))
}

async function handleReviewPut(bodyObj){   // runs onClick
    await fetch(bookUrl, {
        method: "PUT",
        body: JSON.stringify(bodyObj),
        headers: headers
    })
        .catch(err => console.error(err))

    await getBookshelf(userId);
    document.getElementById("add-review-modal-form").reset(); // clear modal text
    return getReviews(userId);   // run get review fn
}


//   9. DELETE BOOK FROM BOOKSHELF OR REVIEW WITH BOOK ID
async function handleBookDelete(bookId){
    await fetch(bookUrl + bookId, {
        method: "DELETE",
        headers: headers
    })
        .catch(err => console.error(err))

    await getReviews(userId);
    return getBookshelf(userId);
}


//   10. POST REVIEW TO DATABASE
async function handleReviewAdd(bodyObj){   // runs onClick
    // save Review to database
    const response = await fetch(`${bookUrl}user/${userId}`, {
        method: "POST",
        body: JSON.stringify(bodyObj),
        headers: headers
    })
        .catch(err => console.error(err.message))
    if (response.status == 200) {
          console.log("review added to database")
          document.getElementById("add-review-modal-form").reset(); // clear modal text
          return getReviews(userId); // run getReviews  getBookshelf(userId);
    }
}

//   11. POST A BOOK FROM THE BOOKSHELF TO THE CURRENT BOOK LIST - set initial pages to 0
async function postCurrentBook(bookId){
    let bodyObj = {
        "currentPage": 0,
        "totalPages": 0
    }
    const response = await fetch(`${currentUrl}user/${userId}/${bookId}`, {
        method: "POST",
        body: JSON.stringify(bodyObj),
        headers: headers
    })
        .catch(err => console.error(err.message))
    if (response.status == 200) {
          console.log("book added to current list")
    }
}



// HELPER FUNCTIONS

// REFACTOR / CLEAN UP GOOGLE DATA
    // remove quotes from data; otherwise there will be issues saving into database
function escapeQuotesFromGoogleAPI(str){
    if( str[0] == '"') {
        str = str.replaceAll('"', '')
    } else {
        str = str.replace(/"/g, "'")
    }
    str = str.replace(/"/g, "\\\"").replace(/'/g, "\\\'")
    return str
}

    // shorten description on page. will utilize a collaspe feature
function shortenDescription(str){
    let result = [];
    result.push(str.slice(0,120))
    result.push(str.slice(120))
    return result
}


// CARDS TO SHOW GOOGLE SEARCH RESULT
const createNoteCards = (array) => {
    noteContainer.innerHTML = ''
    array.forEach( obj => {

        // validate/refactor book data
        let title = String(obj.title)
        let date = String(obj.publishedDate)
        let description = String(obj.description)
        let smallImage = String(obj.smallThumbnail)
        let bigImage = String(obj.thumbnail)
        let infoLink = String(obj.infoLink)

        let authors = obj.authors   // authors received in array
        if(authors) {
            authors = obj.authors.join(", ")   // join authors array into string to store in DB
        } else {
           authors = ""
        }

        title = escapeQuotesFromGoogleAPI(title)   // clean data, escape quotes
        description = escapeQuotesFromGoogleAPI(description)  // clean data
        let descriptionArr = shortenDescription(String(obj.description))  // description front end data

        let noteCard = document.createElement("div")

        noteCard.classList.add("mb-4")
        noteCard.classList.add("col")

        noteCard.innerHTML = `
            <div class="card h-100">

                <a class="text-decoration-none" target="_blank" href="${infoLink}">
                    <img src="${obj.smallThumbnail}" class="card-img-top mx-auto d-block pt-2" alt="book cover">
                </a>

                <div class="card-body">

                    <h5 class="card-title text-center">${obj.title}</h5>
                    <p class="card-text text-center">${authors + " " + obj.publishedDate}</p>

                    <p class="card-text">
                        <span>
                            ${descriptionArr[0]}
                        </span>
                        <span class="collapse" id="collapseExample">
                            ${descriptionArr[1]}
                        </span>
                        <span>
                            <a class="text-decoration-none" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                                ...
                            </a>
                        </span>
                    </p>

                </div>

                <div class="card-footer text-center">
                    <button class="btn btn-outline-secondary btn-sm" onclick="handleAddToBookshelf(['${title}','${date}','${description}','${smallImage}','${bigImage}','${authors}','${infoLink}'])">
                        Add to bookshelf
                    </button>

                    <button class="btn btn-secondary btn-sm" onclick="handleReviewModal(['${title}','${date}','${description}','${smallImage}','${bigImage}','${authors}','${infoLink}'])"
                    type="button" data-bs-toggle="modal" data-bs-target="#add-review-modal">
                        Add review
                    </button>
                </div>

            </div>
        `

        noteContainer.append(noteCard);
    })
}

 // “populateModal” method which accepts an object as an argument and uses that object to populate the fields
     // within the modal as well as assign a custom “data-” tag to the “Save” button element
const populateAddReviewModal = (obj) =>{
    reviewBody.innerText = ''

    // check if obj has book_id (aka already in DB to edit vs new book object, and set attributes) - there are two save btns
    if (obj.book_id != null) {
        putBookshelfReviewBtn.setAttribute('data-review-id', obj.book_id)
        putBookshelfReviewBtn.setAttribute('data-review-title', obj.title)
        putBookshelfReviewBtn.setAttribute('data-review-published', obj.published)
        putBookshelfReviewBtn.setAttribute('data-review-description', obj.description)
        putBookshelfReviewBtn.setAttribute('data-review-smallThumbnail', obj.smallThumbnail)
        putBookshelfReviewBtn.setAttribute('data-review-thumbnail', obj.thumbnail)
        putBookshelfReviewBtn.setAttribute('data-review-authors', obj.authors)
        putBookshelfReviewBtn.setAttribute('data-review-infoLink', obj.infoLink)

        if(obj.review != null) {
            reviewBody.innerText = obj.review
        }

    } else {
        addReviewBtn.setAttribute('data-review-title', obj.title)
        addReviewBtn.setAttribute('data-review-published', obj.published)
        addReviewBtn.setAttribute('data-review-description', obj.description)
        addReviewBtn.setAttribute('data-review-smallThumbnail', obj.smallThumbnail)
        addReviewBtn.setAttribute('data-review-thumbnail', obj.thumbnail)
        addReviewBtn.setAttribute('data-review-authors', obj.authors)
        addReviewBtn.setAttribute('data-review-infoLink', obj.infoLink)
    }
}


// CARDS TO SHOW USER'S BOOKSHELF BOOKS
const createBookshelfCards = (array) => {

    // if bookshelf array is empty
    if(array.length == 0){
        document.getElementById("bookshelfResultEmptyText").style.display = "block";
        document.getElementById("bookshelfResultEmptyText").innerText = `Bookshelf is empty`
    } else {
        document.getElementById("bookshelfResultEmptyText").innerText = ``
        document.getElementById("bookshelfResultEmptyText").style.display = "none";
    }

    bookshelfContainer.innerHTML = ''
    array.forEach( obj => {
        let bookshelfCard = document.createElement("div")
        bookshelfCard.classList.add("mb-4")
        bookshelfCard.classList.add("col")

        bookshelfCard.innerHTML = `
            <div class="card h-100">

                <a class="text-decoration-none" target="_blank" href="${obj.infoLink}">
                    <img src="${obj.smallThumbnail}" class="card-img-top mx-auto d-block pt-2" alt="book cover">
                </a>

                <div class="card-body">
                    <h5 class="card-title text-center">${obj.title}</h5>
                </div>

                <div class="card-footer text-center">

                    <button type="button" class="btn btn-labeled btn-outline-danger btn-sm" onclick="handleBookDelete(${obj.book_id})">
                         <span class="btn-label"><i class="fa fa-trash"></i></span>
                    </button>

                    <button type="button" class="btn btn-labeled btn-warning btn-sm" onclick="postCurrentBook(${obj.book_id})">
                        <span class="btn-label"><i class="fa fa-bookmark"></i></span>
                     </button>

                    <button class="btn btn-secondary btn-sm" onclick="getBookById(${obj.book_id})"
                    type="button" data-bs-toggle="modal" data-bs-target="#add-review-modal">
                        Add review
                    </button>


                </div>

            </div>
        `
        bookshelfContainer.append(bookshelfCard);
    })
}


// CARDS TO SHOW USER'S REVIEWS
const createReviewCards = (array) => {

    // if reviews array is empty
    if(array.length == 0){
        document.getElementById("reviewResultEmptyText").style.display = "block";
        document.getElementById("reviewResultEmptyText").innerText = `No reviews found`
    } else {
        document.getElementById("reviewResultEmptyText").innerText = ``
        document.getElementById("reviewResultEmptyText").style.display = "none";
    }

    reviewContainer.innerHTML = ''      // outer div

    array.forEach( obj => {
        let reviewCard = document.createElement("div")    // first inside div
        reviewCard.classList.add("mb-4")              // first inside div class
        reviewCard.classList.add("col")              // first inside div class

        reviewCard.innerHTML = `
            <div class="card h-100">

                <a class="text-decoration-none" target="_blank" href="${obj.infoLink}">
                    <img src="${obj.smallThumbnail}" class="card-img-top mx-auto d-block pt-2" alt="book cover">
                </a>

                <div class="card-body">
                    <h5 class="card-title">${obj.title}</h5>
                    <p class="card-text">${obj.review}</p>
                </div>

                <div class="card-footer text-center">

                    <button type="button" class="btn btn-labeled btn-outline-danger btn-sm" onclick="handleBookDelete(${obj.book_id})">
                         <span class="btn-label"><i class="fa fa-trash"></i></span>
                    </button>

                    <button class="btn btn-secondary btn-sm" onclick="getBookById(${obj.book_id})"
                    type="button" data-bs-toggle="modal" data-bs-target="#add-review-modal">
                        Edit review
                    </button>
                </div>

            </div>
        `
        reviewContainer.append(reviewCard);
    })
}






// RUN ON PAGE LOAD
getBookshelf(userId)
getReviews(userId)

// *** EVENT LISTENERS ***
submitForm.addEventListener("submit", handleBookSearchSubmit)
// submitBookForm.addEventListener("submit", handleBookSubmit)

// *** MODAL EVENT LISTENERS ***
// POST initial book review button
addReviewBtn.addEventListener("click", (e)=>{
    let reviewObj = {
        "title": e.target.getAttribute('data-review-title'),
        "published": e.target.getAttribute('data-review-published'),
        "description": e.target.getAttribute('data-review-description'),
        "smallThumbnail": e.target.getAttribute('data-review-smallThumbnail'),
        "thumbnail": e.target.getAttribute('data-review-thumbnail'),
        "authors": e.target.getAttribute('data-review-authors'),
        "bookshelf": false,
        "review": reviewBody.value,
        "infoLink": e.target.getAttribute('data-review-infoLink')
    }
    handleReviewAdd(reviewObj);
})

// PUT/UPDATE bookshelf book review button - add review from bookshelf list
putBookshelfReviewBtn.addEventListener("click", (e)=>{
    let reviewObj = {
        "book_id": e.target.getAttribute('data-review-id'),
        "title": e.target.getAttribute('data-review-title'),
        "published": e.target.getAttribute('data-review-published'),
        "description": e.target.getAttribute('data-review-description'),
        "smallThumbnail": e.target.getAttribute('data-review-smallThumbnail'),
        "thumbnail": e.target.getAttribute('data-review-thumbnail'),
        "authors": e.target.getAttribute('data-review-authors'),
        "bookshelf": false,
        "review": reviewBody.value,
        "infoLink": e.target.getAttribute('data-review-infoLink')
    }
    handleReviewPut(reviewObj);
})


// 'Close' book review's modal button
closeReviewBtn.addEventListener("click", (e)=>{
   document.getElementById("add-review-modal-form").reset(); // clear modal text
})










// ******* ADD/POST BOOK TO DATABASE -- USING FORM
//const handleBookSubmit = async (e) => {
//    e.preventDefault() //prevent default behavior of the form
//    let bodyObj = {
//        title: document.getElementById("title-input").value,
//        authors: document.getElementById("author-input").value,
//        published: document.getElementById("published-input").value,
//        description: document.getElementById("description-input").value,
//        smallThumbnail: document.getElementById("smallThumbnail-input").value,
//        thumbnail: document.getElementById("thumbnail-input").value,
//        bookshelf: document.getElementById("bookshelf-input").value,
//        review: document.getElementById("review-input").value
//    }
//    await addBook(bodyObj);  // run addBook function below
//    // value to empty
//    document.getElementById("title-input").value = ''
//    document.getElementById("author-input").value = ''
//    document.getElementById("published-input").value = ''
//    document.getElementById("description-input").value = ''
//    document.getElementById("smallThumbnail-input").value = ''
//    document.getElementById("thumbnail-input").value = ''
//    document.getElementById("bookshelf-input").value = ''
//    document.getElementById("review-input").value = ''
//}
//async function addBook(obj) {
//    const response = await fetch(`${bookUrl}user/${userId}`, {
//        method: "POST",
//        body: JSON.stringify(obj),
//        headers: headers
//    })
//        .catch(err => console.error(err.message))
//    if (response.status == 200) {
//          console.log("added to database")
//    }
//}
// **********


// OLD BUTTONS - before icons
//<button class="btn btn-outline-danger btn-sm" onclick="handleBookDelete(${obj.book_id})">
//    Delete
//</button>
//<button class="btn btn-outline-danger btn-sm" onclick="handleBookDelete(${obj.book_id})">
//    Delete
//</button>
//<button class="btn btn-primary btn-sm" onclick="postCurrentBook(${obj.book_id})">
//    Current
//</button>