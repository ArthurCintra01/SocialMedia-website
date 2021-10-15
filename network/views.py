from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
import json

from .models import User, Post

class newPostForm(forms.Form):
    new_post = forms.CharField(label=False, widget=forms.Textarea(attrs={'id':'content', 'class':'formfield'}))


def index(request):
    return render(request, "network/index.html")

def posts(request, username):
    if username == "all":
        posts = Post.objects.all()
        posts = posts.order_by("-timestamp").all()
        for post in posts:
            if request.user in post.usersLiked.all():
                post.liked = True
        return JsonResponse([post.serialize() for post in posts], safe=False)
    elif username == "following":
        following_posts = []
        user = request.user
        posts = Post.objects.all()
        for post in posts:
            if post.user in user.following.all():
                following_posts.append(post)
        for post in following_posts:
            if request.user in post.usersLiked.all():
                post.liked = True
        return JsonResponse([post.serialize() for post in following_posts], safe=False)
    else:
        postsUser = User.objects.get(username = username)
        posts = Post.objects.filter(user = postsUser).all() 
        posts = posts.order_by("-timestamp").all()
        for post in posts:
            if request.user in post.usersLiked.all():
                post.liked = True
        return JsonResponse([post.serialize() for post in posts], safe=False)

def user(request, username):
    try:
        user = User.objects.get(username=username)
    except Post.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    if request.method == 'GET':
        return JsonResponse(user.serialize())

    # to follow/ unfollow user
    if request.method == 'PUT':
        data = json.loads(request.body)
        if data.get("follow") == True:
            if request.user in user.following.all():
                user.following.remove(request.user)
            else:
                user.following.add(request.user)
        user.save()
        return HttpResponse(status=204)

@login_required
def profile_page(request, username):
    user = User.objects.get(username=username)
    return render(request, "network/profilepage.html",{
        "profile_user": user,
        "user": request.user
    })
        
        

@csrf_exempt
@login_required
def add(request):
    # check if request method is post
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
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
    try:
        post = Post.objects.get(pk=post_id)
        user = request.user
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    if request.method == 'PUT':
        data = json.loads(request.body)
        if data.get("like") == True:
            if user in post.usersLiked.all():
                post.usersLiked.remove(user)
                post.likes = post.likes - 1
                post.liked = False
            else:
                post.usersLiked.add(user)
                post.likes = post.likes + 1
                post.liked = True
        post.save()
        return HttpResponse(status=204)

    if request.method == 'GET':
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
