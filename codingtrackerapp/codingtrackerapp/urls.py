"""
URL configuration for codingtrackerapp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from myapp import views
from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path('', views.home, name='index'),
    path('dashboard/', views.get_dashboard, name='get_dashboard'),
    path('get_stock_data/', views.get_stock_data, name='get_stock_data'),
    path('create_account/', views.create_account, name='create_account'),

    path('accounts/login/', views.my_login_view, name='login'),
    path('', auth_views.LogoutView.as_view(), name='account_logout'),
]

