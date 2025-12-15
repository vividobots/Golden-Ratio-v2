# goldenratio_backend/Dockerfile

# Use Python image
FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Install system dependencies (needed for Postgres and Image processing)
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Install Gunicorn (Production Server)
RUN pip install gunicorn google-cloud-storage django-storages

# Copy the rest of the code
COPY . .

# Run the app using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "golden_ratio.wsgi:application"]