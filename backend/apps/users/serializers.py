from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, WeightLog

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id', 'age', 'height', 'weight', 'gender', 
            'activity_level', 'target_calories', 
            'target_protein', 'target_carbs', 'target_fat'
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        if profile_data:
            profile = user.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return user


class WeightLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightLog
        fields = ['id', 'date', 'weight']

    def create(self, validated_data):
        user = self.context['request'].user
        # Automatically update the user's Profile current weight when they log a new weight
        weight = validated_data['weight']
        profile = user.profile
        profile.weight = weight
        profile.save()
        
        # Save or update weight log for that day
        obj, created = WeightLog.objects.update_or_create(
            user=user,
            date=validated_data['date'],
            defaults={'weight': weight}
        )
        return obj

