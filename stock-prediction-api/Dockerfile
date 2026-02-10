FROM python:3.11-slim

WORKDIR /stock-prediction-api

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy requirements
COPY requirements.txt .

# Install dependencies with increased timeout and retries
RUN pip install --upgrade pip setuptools wheel && \
    pip install --default-timeout=3000 --retries 5 --no-cache-dir -r requirements.txt

# Copy the app code
COPY . .

# Expose the port
EXPOSE 8000

# Run the FastAPI app
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
