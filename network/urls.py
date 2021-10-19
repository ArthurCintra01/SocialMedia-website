
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:username>", views.profile_page, name="profile_page"),
    
    #API Routes
    path("posts/<str:username>", views.posts, name="posts"),
    path("add", views.add, name="add"),
    path("post/<int:post_id>", views.post, name="post"),
    path("user/<str:username>", views.user, name="user"),
    path("user_posts/<str:username>", views.user_posts, name="user_posts"),
    path("current_user", views.current_user, name="current_user")
]
