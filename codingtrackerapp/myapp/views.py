from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth.decorators import login_required
from .forms import SignUpForm
from .models import UsersTickers, Ticker
import yfinance as yf
import csv
import re

#INDEX VIEW
def home(request):
    users = User.objects.all()
    return render(request, 'index.html', {'currentUsers' : users, 'loggedIn' : request.user.is_authenticated})

#REQUEST STOCK DATA
@login_required
def get_stock_data(request):
    try:
        ticker_symbols = request.GET.getlist('ticker')

        timeSeries = []
        for t in ticker_symbols:
            timeSeries.append(yf.Ticker(t).history(period="1y"))

        dates = timeSeries[0].index.tolist()
        close_prices = []
        volumes = []
        for h in timeSeries:
            close_prices.append(h['Close'].tolist())
            volumes.append(h['Volume'].tolist())
        data = {'dates': dates, 'close_prices': close_prices, 'volumes_data' : volumes}
        print(timeSeries)
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)})

#GET DASHBOARD WITH TICKERS
@login_required
def get_dashboard(request):
    tickers_file = open('../tickers.csv')
    tickers = []
    
    csvreader = csv.reader(tickers_file)
    header = []
    header = next(csvreader)

    for row in csvreader:
        tickers.append(re.sub(r'[^a-zA-Z]', '', str(row)))

    user_tickers, created = UsersTickers.objects.get_or_create(user=request.user)
    ticker_symbols = []
    for ticker in user_tickers.tickers.all():
        ticker_symbols.append(ticker.symbol)
        
    return render(request, 'dashboard.html', { "tickers" : tickers, "user_tickers" : ticker_symbols, 'loggedIn' : request.user.is_authenticated })

#UPDATE TICKERS
def update_tickers(request):
    user_tickers, created = UsersTickers.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        ticker_instance = request.GET.get('ticker')
        #if ticker needs to be put in list
        if ticker_instance:
            ticker, created = Ticker.objects.get_or_create(symbol=ticker_instance)

            #only add if not already in list
            if ticker not in user_tickers.tickers.all():
                user_tickers.tickers.add(ticker)
            return JsonResponse({'message': 'Ticker added successfully'}, status=201)
        else:
            return HttpResponseBadRequest('Ticker symbol not provided')
    elif request.method == 'DELETE':
        ticker_instance = request.GET.get('ticker')
        #if ticker needs to be removed from the list
        if ticker_instance:
            ticker, created = Ticker.objects.get_or_create(symbol=ticker_instance)
            user_tickers.tickers.remove(ticker)
            return JsonResponse({'message': 'Ticker removed successfully'})
        else:
            return HttpResponseBadRequest('Ticker symbol not provided')


#CREATE USER ACCOUNT
def create_account(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('index')
    else:
        form = SignUpForm()
    return render(request, 'create_account.html', {'form': form, 'loggedIn' : request.user.is_authenticated})

#USER LOGIN
def my_login_view(request):
    if not request.user.is_authenticated:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('index')
            else:
                return render(request, 'login.html', {'error': 'Invalid username or password', 'loggedIn' : request.user.is_authenticated})
        else:
            return render(request, 'login.html', {'loggedIn' : request.user.is_authenticated})
    else:
        return redirect('index')
    
#USER LOGOUT
@login_required
def my_logout_view(request):
    logout(request)
    return render(request, 'logout.html')