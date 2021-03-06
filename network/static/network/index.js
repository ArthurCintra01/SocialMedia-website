let page = 1;
let type_page = 'all';
let user_now = '';
document.addEventListener('DOMContentLoaded', function(){ 
    // getting user that requested the page
    fetch('/current_user')
    .then(response => response.json())
    .then(current_user => {
        user_now = current_user;
    })
    document.querySelector('#new_post_form').addEventListener('submit', create_post);
    document.querySelector('#content').value = '';
    document.querySelector('#following').addEventListener('click', () => load_posts('following'));
    //change pages
    document.querySelector('#next_page').addEventListener('click',function(){
        page++;
        load_posts(type_page);
    })
    document.querySelector('#previous_page').addEventListener('click',function(){
        if (page>1){
            page--;
            load_posts(type_page);
        }
    })
    resize('formfield');
    // by default load posts
    load_posts('all');
});

function resize(textarea){
    // for resizing the text areas
    const tx = document.getElementsByClassName(`${textarea}`);
    for (let i = 0; i < tx.length; i++) {
        tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
        tx[i].addEventListener("input", OnInput, false);
    }
}

function OnInput() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
  }

function load_posts(type) {
    // cleaning up the old posts
    document.querySelector('#posts').innerHTML = '';
    if (type == 'following'){
        type_page = 'following';
        document.querySelector('h2').innerHTML = "Following";
        document.querySelector('#newPostView').style.display = 'none';
    }
    // getting the new posts
    fetch(`/posts/${type}?page=${page}`)
    .then(response => response.json())
    .then(posts => {
        num = posts.length;
        for(const post in posts){
            // getting the info for each post
            user = posts[post].user;
            content = posts[post].content;
            timestamp = posts[post].timestamp;
            likes = posts[post].likes;
            // creating the body of the posts
            let post_div = document.createElement('div');
            post_div.id = "post_div";
            post_div.innerHTML = `<div onclick="profile_page('${user}')" id="username"><strong>${user}</strong></div>`;
             // adding content area
             let content_area = document.createElement('textarea');
             content_area.id = 'content_area';
             content_area.classList = 'content_area';
             content_area.disabled = true;
             content_area.innerHTML = `${content}`;
            // adding edit button to posts of the user
            if ( posts[post].user == user_now){
                let edit_btn = document.createElement('button');
                edit_btn.id = 'edit_btn';
                edit_btn.innerHTML = 'edit post';
                edit_btn.addEventListener('click', () => edit_post(content_area,posts[post],edit_btn));
                post_div.append(edit_btn);
            }
            //appending content area to post div
            post_div.append(content_area);
            // adding timestamp
            let timestamp_span = document.createElement('span');
            timestamp_span.id = 'timestamp';
            timestamp_span.innerHTML = `${timestamp}<br>`;
            post_div.append(timestamp_span);
            // adding like button to all posts
            let like_btn = document.createElement('button')
            if (posts[post].liked == true){
                like_btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                </svg> ${likes}`;
            }else{
                like_btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                </svg> ${likes}`;
            }
            like_btn.id = "like_button";
            like_btn.addEventListener('click', () => like_post(posts[post], like_btn));
            // appending the like button into the post body
            post_div.append(like_btn);
            // appending post to the posts div
            document.querySelector('#posts').append(post_div);
            document.querySelector('#posts').style.display = 'block';
            resize('content_area');
        }
        // disable previous page button if there is none
        if (page==1){
            document.querySelector('#previous_page').disabled = true;
        }else{
            document.querySelector('#previous_page').disabled = false;
        }
        // disable next page button if there is none
        //for all posts
        if (type == 'all'){
            fetch('/posts/count')
            .then(response => response.json())
            .then(number_pages => {
                if (page == number_pages){
                    document.querySelector('#next_page').disabled = true;
                }else{
                    document.querySelector('#next_page').disabled = false;
                }
            })
        // for following posts
        }else if( type == 'following'){
            fetch('/posts/following_count')
            .then(response => response.json())
            .then(number_pages => {
                if (page == number_pages){
                    document.querySelector('#next_page').disabled = true;
                }else{
                    document.querySelector('#next_page').disabled = false;
                }
            })
        }
        
    })

}

function edit_post(content_area,post,edit_btn){
    if(content_area.disabled == true){
        edit_btn.innerHTML = 'save post';
        content_area.disabled = false;
        content_area.focus();
        
    }else{
        edit_btn.innerHTML = 'edit post';
        content_area.disabled = true;
        fetch(`/post/${post.id}`,{
            method: 'POST',
            body: JSON.stringify({
                content: content_area.value
            })
        })
    }   
}

function create_post(event){
    event.preventDefault();
    // get content from form
    const content = document.querySelector('#content').value
    // add post
    fetch('/add',{
        method: 'POST',
        body: JSON.stringify({
            content: content
        })
    })
    .then(response => response.json())
    .then(() => {
        location.reload();
    });
}

function like_post(post, like_btn){
        fetch(`/post/${post.id}`,{
            method: 'PUT',
            body: JSON.stringify({
                like: true
            })
        })
        .then(() => {
            fetch(`/post/${post.id}`)
            .then(response => response.json())
            .then(updated_post => {
                if (updated_post.liked == true){
                    like_btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                    <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                    </svg> ${updated_post.likes}`;
                }else{
                    like_btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                    </svg> ${updated_post.likes}`;
                }
            })
        });
}

function profile_page(user){
    fetch(`/profile/${user}`)
    document.location.href = `/profile/${user}`;
}