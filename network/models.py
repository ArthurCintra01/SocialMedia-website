from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("User", blank=True, related_name="user_followers")
    following = models.ManyToManyField("User", blank=True, related_name="user_following")

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.RESTRICT, related_name="posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    usersLiked = models.ManyToManyField("User", blank=True, related_name="liked")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "content": self.content,
            "likes": self.likes,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }

    def __str__(self):
        return f"id:{self.id} {self.user.username} at {self.timestamp.hour}:{self.timestamp.minute}"