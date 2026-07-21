from rest_framework import serializers
from .models import FoodItem, Meal, MealFoodItem


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['id', 'name', 'calories', 'protein', 'carbs', 'fat', 'serving_size', 'created_by']
        read_only_fields = ['created_by']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)


class MealFoodItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    food_name = serializers.CharField(source='food_item.name', read_only=True)
    food_serving_size = serializers.CharField(source='food_item.serving_size', read_only=True)
    
    # Custom read-only fields for computed totals
    total_calories = serializers.IntegerField(read_only=True)
    total_protein = serializers.FloatField(read_only=True)
    total_carbs = serializers.FloatField(read_only=True)
    total_fat = serializers.FloatField(read_only=True)

    class Meta:
        model = MealFoodItem
        fields = [
            'id', 'food_item', 'food_name', 'food_serving_size', 'servings', 
            'total_calories', 'total_protein', 'total_carbs', 'total_fat'
        ]


class MealSerializer(serializers.ModelSerializer):
    foods = MealFoodItemSerializer(many=True)
    total_calories = serializers.SerializerMethodField()
    total_protein = serializers.SerializerMethodField()
    total_carbs = serializers.SerializerMethodField()
    total_fat = serializers.SerializerMethodField()

    class Meta:
        model = Meal
        fields = [
            'id', 'date', 'meal_type', 'notes', 'foods', 
            'total_calories', 'total_protein', 'total_carbs', 'total_fat'
        ]

    def get_total_calories(self, obj):
        return sum(item.total_calories for item in obj.foods.all())

    def get_total_protein(self, obj):
        return round(sum(item.total_protein for item in obj.foods.all()), 1)

    def get_total_carbs(self, obj):
        return round(sum(item.total_carbs for item in obj.foods.all()), 1)

    def get_total_fat(self, obj):
        return round(sum(item.total_fat for item in obj.foods.all()), 1)

    def create(self, validated_data):
        foods_data = validated_data.pop('foods', [])
        user = self.context['request'].user
        meal = Meal.objects.create(user=user, **validated_data)

        for food_data in foods_data:
            food_item_obj = food_data.pop('food_item')
            MealFoodItem.objects.create(meal=meal, food_item=food_item_obj, **food_data)

        return meal

    def update(self, instance, validated_data):
        foods_data = validated_data.pop('foods', None)

        instance.date = validated_data.get('date', instance.date)
        instance.meal_type = validated_data.get('meal_type', instance.meal_type)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.save()

        if foods_data is not None:
            # Delete old food associations and rewrite
            instance.foods.all().delete()
            for food_data in foods_data:
                food_item_obj = food_data.pop('food_item')
                # Strip ID if it was included in nested payload
                food_data.pop('id', None)
                MealFoodItem.objects.create(meal=instance, food_item=food_item_obj, **food_data)

        return instance
