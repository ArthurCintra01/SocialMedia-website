
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
    path("post/<int:post_id>", views.post, name="post"),
    path("user/<str:username>", views.user, name="user")
]
