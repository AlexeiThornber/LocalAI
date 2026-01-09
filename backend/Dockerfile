FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your Flask app
COPY db.py .

# Create users directory
RUN mkdir -p /app/users

EXPOSE 5000

CMD ["python", "db.py"]