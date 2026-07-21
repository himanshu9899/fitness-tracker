from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver


class User(AbstractUser):
    email = models.EmailField(unique=True)

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username


class Profile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    ACTIVITY_CHOICES = [
        ('SEDENTARY', 'Sedentary (little or no exercise)'),
        ('LIGHTLY_ACTIVE', 'Lightly Active (light exercise 1-3 days/week)'),
        ('MODERATELY_ACTIVE', 'Moderately Active (moderate exercise 3-5 days/week)'),
        ('VERY_ACTIVE', 'Very Active (hard exercise 6-7 days/week)'),
        ('EXTRA_ACTIVE', 'Extra Active (very hard exercise/physical job)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='SEDENTARY')
    
    # Nutritional Goals
    target_calories = models.IntegerField(default=2000, help_text="Daily calorie goal")
    target_protein = models.IntegerField(default=150, help_text="Daily protein goal in grams")
    target_carbs = models.IntegerField(default=200, help_text="Daily carbs goal in grams")
    target_fat = models.IntegerField(default=70, help_text="Daily fat goal in grams")

    def __str__(self):
        return f"{self.user.username}'s Profile"


class WeightLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weight_logs')
    date = models.DateField()
    weight = models.FloatField(help_text="Weight in kg")

    class Meta:
        ordering = ['date']
        constraints = [
            models.UniqueConstraint(fields=['user', 'date'], name='unique_weight_log_per_day')
        ]

    def __str__(self):
        return f"{self.user.username} - {self.weight} kg on {self.date}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):

    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
