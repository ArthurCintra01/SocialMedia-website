document.addEventListener('DOMContentLoaded', function(){
    user = document.querySelector('h2').innerHTML
    fetch(`/user/${user}`)
    .then(response => response.json())
    .then(profile => {
        followers = profile.followers;
        document.querySelector('#info').innerHTML = `<strong>followers: </strong> ${followers}`
    })
});