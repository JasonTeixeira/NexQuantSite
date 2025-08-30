FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir fastapi uvicorn[standard] optuna requests
COPY src ./src
CMD ["uvicorn", "src.hpo_service:app", "--host", "0.0.0.0", "--port", "3011"]


