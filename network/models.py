from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("User", blank=True, related_name="user_followers")
    following = models.ManyToManyField("User", blank=True, related_name="user_following")
    current_user_follows = models.BooleanField(default=False)

    def serialize(self):
        return {
            "followers": [user.username for user in self.followers.all()],
            "following": [user.username for user in self.following.all()],
            "current_user_follows": self.current_user_follows
        }
        

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.RESTRICT, related_name="posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    usersLiked = models.ManyToManyField("User", blank=True, related_name="liked")
    liked = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "usersLiked": [user.username for user in self.usersLiked.all()],
            "content": self.content,
            "likes": self.likes,
            "liked": self.liked,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }

    def __str__(self):
        return f"id:{self.id} {self.user.username} at {self.timestamp.hour}:{self.timestamp.minute}"