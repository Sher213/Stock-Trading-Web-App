from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .forms import SignUpForm
from .models import CustomUser
import yfinance as yf
import csv
import re

#INDEX VIEW
def home(request):
    users = CustomUser.objects.all()
    return render(request, 'index.html', {'currentUsers' : users})

#REQUEST STOCK DATA
def get_stock_data(request):
    try:
        ticker_symbol = request.GET.get('ticker')
        print(request.user.username)
        tSeries = yf.Ticker(ticker_symbol)
        hist = tSeries.history(period="1y")

        dates = hist.index.tolist()
        close_prices = hist['Close'].tolist()
        data = {'dates': dates, 'close_prices': close_prices}

        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)})

def get_dashboard(request):
    tickers_file = open('../tickers.csv')
    tickers = []
    
    csvreader = csv.reader(tickers_file)
    header = []
    header = next(csvreader)

    for row in csvreader:
        tickers.append(re.sub(r'[^a-zA-Z]', '', str(row)))

    return render(request, 'dashboard.html', { "tickers" : tickers })

#CREATE USER ACCOUNT
def create_account(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('index')
    else:
        form = SignUpForm()
    return render(request, 'create_account.html', {'form': form})

def my_login_view(request):
    if not request.user.is_authenticated:
        if request.method == 'POST': 
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = None
            try:
                user = CustomUser.objects.get(username=username)
                if user.check_password(password):
                    if user is not None:
                        login(request, user)
                        return redirect('index')
                    else:
                        return render(request, 'login.html', {'error': 'Invalid username or password'})
            except CustomUser.DoesNotExist:
                return render(request, 'login.html', {'error': 'Invalid username or password'})
        else:
            return render(request, 'login.html')
    else:
        return redirect('index')