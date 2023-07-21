import os
import secrets
from dotenv import load_dotenv
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from flask import Flask, redirect, request, render_template, session
from donationalerts import DonationAlertsAPI, Scopes

app = Flask(__name__)
app.secret_key = secrets.token_urlsafe(32)
load_dotenv()
fernet = Fernet(os.getenv('FERNET_KEY'))
api = DonationAlertsAPI('11200',
                        os.getenv('DA_KEY'),
                        'https://donations-credits.atakashi69.repl.co/login',
                        [Scopes.DONATION_INDEX])


def get_donations(access_token):
    access_token = fernet.decrypt(access_token).decode()
    donations_list = api.donations_list(access_token).objects['data']
    filtered_donations = [
        item for item in donations_list
        if 'created_at' in item and datetime.fromisoformat(item['created_at']) >= datetime.now() - timedelta(hours=24)
    ]

    summary = {}
    for donation in filtered_donations:
        username = donation['username']
        amount = donation['amount']

        if username in summary:
            summary[username] += amount
        else:
            summary[username] = amount
    summary = [{'username': username, 'amount': amount} for username, amount in summary.items()]
    summary.sort(key=lambda x: x['amount'], reverse=True)

    return summary


@app.route('/')
def index():
    return redirect('home')

@app.route('/login')
def login():
    code = request.args.get('code')
    if code is None:
        return redirect(api.login())

    session['auth'] = True
    session['access_token'] = api.get_access_token(code)
    return redirect('home')

@app.route('/logout')
def logout():
    session.pop('auth')
    return redirect('home')

@app.route('/home')
def home():
    credits_fps = session.get('credits_fps', default=60)
    credits_speed = session.get('credits_speed', default=10)
    credits_pause = session.get('credits_pause', default=2)
    at = session.get('access_token', default='')
    encrypted = fernet.encrypt(at.encode())
    return render_template('home.html',
                           at=encrypted.decode(),
                           credits_fps=credits_fps,
                           credits_speed=credits_speed,
                           credits_pause=credits_pause)

@app.route('/donations')
def donations():
    try:
        at = request.args.get('at')
        if at is None:
            return redirect('home')

        donations_list = get_donations(at)

        session['credits_fps'] = request.args.get('credits_fps')
        session['credits_speed'] = request.args.get('credits_speed')
        session['credits_pause'] = request.args.get('credits_pause')

        return render_template('donations.html', donations=donations_list)
    except KeyError as e:
        print('Exception:', e)
        return redirect('login')


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False)
    session['permanent'] = True