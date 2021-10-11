document.addEventListener('DOMContentLoaded', function(){
   fetch('/network/posts')
   .then(response => response.json())
   .then(posts => {
        for(const post in posts){
            //user = posts[post].user;
            content = posts[post].content;
            timestamp = posts[post].timestamp;
            likes = posts[post].likes;
            let post_div = document.createElement('div');
            post_div.innerHTML = `content: ${content}, timestamp: ${timestamp}
            likes: ${likes}`;
            document.querySelector('#posts').append(post_div);
       }
   }) 
});