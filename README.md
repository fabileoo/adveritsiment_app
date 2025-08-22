делаешь эти команды по очереди 

установка зависимостей:

git clone https://github.com/OldBorov1337/adveritsiment_app.git
cd adveritsiment_app
python либо (python3) -m venv venv
venv/Scripts/activate
pip install -r requirements.txt

уставнока react:

cd app/frontend
npm install (если  установлены пакеты, но в репозитории должны быть установлены но может удалилилсь)
npm build (собрать сборку)


чтобы все запустить 
просто в главной папке при активном виртуальном окружении
uvicorn main:app --reload 

а потом 

cd app/frontend
npm start 

откроется страница, попробуй такие данные 
login: m89
password: 123

+ ко всему этому нужна активная база данных и файл .env который тебе надо создать просто в главной папке, его код я прислал в телегу  
