
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    #API Routes
    path("network/posts", views.posts, name="posts"),
    path("add", views.add, name="add"),
    path("like_post/<int:post_id>", views.like_post, name="like_post")
]
