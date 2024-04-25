from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class StockData(models.Model):
    symbol = models.CharField(max_length=10)
    csv_file = models.FileField(upload_to='stock_data/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.symbol} - {self.uploaded_at}"
    
class CustomUser(AbstractUser):
    email = models.EmailField(max_length=254, unique=True)
    stock_data_tickers = models.ManyToManyField('StockData', related_name='users', blank=True)
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='customuser_permissions',
    )
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='customuser_set',
    )

    def __str__(self):
        return self.username