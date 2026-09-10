FROM python:3.11-slim

WORKDIR /dbt

# Install dbt-postgres
RUN pip install --no-cache-dir dbt-postgres==1.7.4

# Copy dbt project files
COPY . .

# Set environment variables for dbt
ENV DBT_PROFILES_DIR=/dbt

# Default command
CMD ["dbt", "debug"]
