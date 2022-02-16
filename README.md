# Local dev
Install frontend dependencies and compile dev
```bash
cd frontend/
npm install
npm run dev
```

Install backend dependencies, migrate database, and launch dev server
```bash
python -m venv ./venv/
. ./venv/bin/activate

# NOTE(SW): must copy in required data files for spectracl or set in config/settings.py
git clone https://github.com/scwatts/spectracl.git
pip install Django djangorestframework huey pandas scikit-learn scipy ./spectracl/

./manage.py makemigrations backend
./manage.py migrate

# Terminal one
./manage.py runserver
# Terminal two
./manage.py run_huey
```

# TODO
## Error handling
* server does not accept upload
