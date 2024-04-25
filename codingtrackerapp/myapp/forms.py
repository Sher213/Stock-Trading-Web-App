from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
from django.db.models import ManyToManyField

class SignUpForm(UserCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password1', 'password2')

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        email = cleaned_data.get('email')

        if CustomUser.objects.filter(username=username).exists():
            self.add_error('username', 'Username already exists.')
        if CustomUser.objects.filter(email=email).exists():
            self.add_error('email', 'Email already exists.')

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        return user