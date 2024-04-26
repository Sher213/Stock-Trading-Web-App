from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UsersTickers(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tickers = models.ManyToManyField('Ticker', blank=True)

    def __str__(self):
        return self.user.username

class Ticker(models.Model):
    symbol = models.CharField(max_length=20)

    def __str__(self):
        return self.symbol
