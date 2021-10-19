from django.contrib.auth import authenticate, login, logout
from django.core import paginator
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
import json
from django.core.paginator import Paginator

from .models import User, Post

class newPostForm(forms.Form):
    new_post = forms.CharField(label=False, widget=forms.Textarea(attrs={'id':'content', 'class':'formfield'}))


def index(request):
    return render(request, "network/index.html")

@login_required
def posts(request, username):
    if username == "all":
        # getting the posts
        posts = Post.objects.all()
        # order by newer
        posts = posts.order_by("-timestamp").all()
        #pagination
        p = Paginator(posts,10)
        page = request.GET.get('page')
        posts = p.get_page(page)
        # see if user liked the posts
        for post in posts:
            if request.user in post.usersLiked.all():
                post.liked = True
        # return posts
        return JsonResponse([post.serialize() for post in posts], safe=False)

    elif username == "following":
        following_posts = []
        user = request.user
        # getting all posts
        posts = Post.objects.all()
        posts = posts.order_by("-timestamp").all()
        # getting only posts from users that the current user is following
        for post in posts:
            if post.user in user.following.all():
                following_posts.append(post)
        # see if user liked the posts
        for post in following_posts:
            if request.user in post.usersLiked.all():
                post.liked = True
            post.save()
        # pagination
        p = Paginator(following_posts,10)
        page = request.GET.get('page')
        following_posts = p.get_page(page)
        # return posts
        return JsonResponse([post.serialize() for post in following_posts], safe=False)
    
     # getting the total of posts
    elif username == "count":
        posts = Post.objects.all()
        posts = posts.order_by("-timestamp").all()
        p = Paginator(posts,10)
        number_pages = p.num_pages
        return JsonResponse(number_pages, safe=False)

    elif username=="following_count":
        following_posts = []
        user = request.user
        # getting all posts
        posts = Post.objects.all()
        posts = posts.order_by("-timestamp").all()
        # getting only posts from users that the current user is following
        for post in posts:
            if post.user in user.following.all():
                following_posts.append(post)
        # pagination
        p = Paginator(following_posts,10)
        number_pages = p.num_pages
        return JsonResponse(number_pages, safe=False)

    # getting posts from specific user
    else:
        # getting only posts posted by the current user
        postsUser = User.objects.get(username = username)
        posts = Post.objects.filter(user = postsUser).all() 
        posts = posts.order_by("-timestamp").all()
        # see if the user liked his own posts
        for post in posts:
            if request.user in post.usersLiked.all():
                post.liked = True
        # pagination
        p = Paginator(posts,10)
        page = request.GET.get('page')
        posts = p.get_page(page)
        # return posts
        return JsonResponse([post.serialize() for post in posts], safe=False)
    

@login_required
@csrf_exempt
def user(request, username):
    # get user by it's username
    user = User.objects.get(username=username)
    
    if request.method == 'GET':
        # see if the user is being followed by the current user
        if request.user in user.followers.all():
            user.current_user_follows = True
        else:
            user.current_user_follows = False
        # return the user
        return JsonResponse(user.serialize())

    # to follow/ unfollow user
    if request.method == 'PUT':
        current_user = request.user
        user = User.objects.get(username=username)
        # getting the data from the fetch call
        data = json.loads(request.body)
        if data.get("follow") == True:
            # checking if the current user is following the user of the page
            if current_user in user.followers.all():
                # remove from followers if his already following 
                user.followers.remove(current_user)
                current_user.following.remove(user)
                user.current_user_follows = False
            elif current_user not in user.followers.all():
                # add to followers if his not a follower
                current_user.following.add(user)
                user.followers.add(current_user)
                user.current_user_follows = True
        # save to database
        current_user.save()
        user.save()
        return HttpResponse(status=204)

# returns the current user
def current_user(request):
    user = request.user
    return JsonResponse(user.username,safe=False)

# returns the number of posts of a user
def user_posts(request,username):
    user = User.objects.get(username=username)
    posts = Post.objects.filter(user = user).all()
    posts = posts.order_by("-timestamp").all()
    p = Paginator(posts,10)
    number_pages = p.num_pages
    return JsonResponse(number_pages,safe=False)


@login_required
@csrf_exempt
def profile_page(request, username):
    # get user
    user = User.objects.get(username=username)
    # rendering profile page of the user
    return render(request, "network/profilepage.html",{
        "profile_user": user,
        "user": request.user
    })
        

@csrf_exempt
@login_required
def add(request):
    # check if request method is post
    if request.method == "POST":
        # Get contents of post 
        data = json.loads(request.body)
        user= request.user
        content= data.get("content", "")
        # Create post
        post = Post(
            user = user,
            content = content,
        )
        post.save()
        return JsonResponse({"message": "New post created"}, status=201)
        

@login_required
@csrf_exempt
def post(request, post_id):
    # getting post by it's id
    try:
        post = Post.objects.get(pk=post_id)
        user = request.user
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    # for editing the post
    if request.method == 'POST':
        # getting the new content of the post
        data = json.loads(request.body)
        post.content = data.get("content")
        # saving changes to the post
        post.save()
        return HttpResponse(status=204)

    # for liking/unliking a post
    if request.method == 'PUT':
        data = json.loads(request.body)
        if data.get("like") == True:
            # checking if user liked the post 
            if user in post.usersLiked.all():
                # removing user from the likes
                post.usersLiked.remove(user)
                post.likes = post.likes - 1
                post.liked = False
            else:
                # adding user to the likes
                post.usersLiked.add(user)
                post.likes = post.likes + 1
                post.liked = True
        # saving posts
        post.save()
        return HttpResponse(status=204)

    if request.method == 'GET':
        # checking if current user liked the post
        if user in post.usersLiked.all():
            post.liked = True
        else: 
            post.liked = False
        # saving changes to the post
        post.save()
        # returning the post
        return JsonResponse(post.serialize())


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
