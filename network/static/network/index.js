document.addEventListener('DOMContentLoaded', function(){
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
            post_div.innerHTML = `<p>User: ${user}</p> 
            <p>Content: ${content}</p> 
            <p>Timestamp: ${timestamp}</p>
            <p>Likes: ${likes} <button>Like</button></p>`;
            document.querySelector('#posts').append(post_div);
       }
   })
   const form = document.getElementById('#new_post_form'); 
   form.addEventListener('submit', create_post);
});

function create_post(){
    //send post request to the api to add new post to the database
}