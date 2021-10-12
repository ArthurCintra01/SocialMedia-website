document.addEventListener('DOMContentLoaded', function(){
    document.querySelector('#new_post_form').addEventListener('submit', create_post);
    document.querySelector('#content').value = '';
    // by default load posts
    load_posts();
});

function load_posts() {
    fetch('/network/posts')
    .then(response => response.json())
    .then(posts => {
        for(const post in posts){
            user = posts[post].user;
            content = posts[post].content;
            timestamp = posts[post].timestamp;
            likes = posts[post].likes;
            let post_div = document.createElement('div');
            post_div.style = "margin: 10px; border: 1px solid #626262; padding: 20px;"
            post_div.innerHTML = `<p>Posted by: ${user}<br> 
            ${content} <br>
            Timestamp: ${timestamp}<br>
            <button>Like</button> ${likes} </p>`;
            document.querySelector('#posts').append(post_div);
       }
   })
}

function create_post(event){
    event.preventDefault();
    // get content from form
    const content = document.querySelector('#content').value
    //send post request to the api to add new post to the database
    fetch('/add',{
        method: 'POST',
        body: JSON.stringify({
            content: content
        })
    })
    .then(response => response.json())
    .then( () => {
      location.reload();
    });
}