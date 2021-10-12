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
            post_div.style = "margin: 10px; border: 1px solid #c0c0c0; padding: 20px;"
            post_div.innerHTML = `<p>user: ${user}</p> 
            <p>content: ${content}</p> 
            <p>timestamp: ${timestamp}</p>
            <p>likes: ${likes}</p>`;
            document.querySelector('#posts').append(post_div);
       }
   }) 
});