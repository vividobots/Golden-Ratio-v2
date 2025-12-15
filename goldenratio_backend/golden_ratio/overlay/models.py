from django.db import models
from users.models import User

class ProcessedImage(models.Model):
    id = models.CharField(primary_key=True, max_length=64)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="processed_images")
    original_image = models.ImageField(upload_to="originals/")
    shrink_image = models.ImageField(upload_to="shrinks/", blank=True, null=True)
    bulge_image = models.ImageField(upload_to="bulges/", blank=True, null=True)
    asym_mask = models.ImageField(upload_to="asym_masks/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id} (User: {self.user.username})"
