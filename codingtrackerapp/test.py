from myapp.models import User
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate, login

# Query all users
user = User.objects.get(username='asher')

print(user.password)
print(check_password('WSMib3w*BL4Ee8d', user.password))
