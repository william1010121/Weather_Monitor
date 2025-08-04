docker run -d \
    --name ai_debate_db \
    -e POSTGRES_USER=weather_user \
    -e POSTGRES_PASSWORD=weather_password \
    -e POSTGRES_DB=weather_db \
    -p 5432:5432 \
    postgres:15
