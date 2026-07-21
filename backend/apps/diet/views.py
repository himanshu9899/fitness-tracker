from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import FoodItem, Meal
from .serializers import FoodItemSerializer, MealSerializer


class FoodItemListCreateView(generics.ListCreateAPIView):
    serializer_class = FoodItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return standard food items (created_by is null) OR custom items created by the user
        return FoodItem.objects.filter(
            Q(created_by__isnull=True) | Q(created_by=self.request.user)
        )


class MealListCreateView(generics.ListCreateAPIView):
    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Meal.objects.filter(user=self.request.user)


class MealDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Meal.objects.filter(user=self.request.user)
